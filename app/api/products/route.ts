import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import {
  loggedIn,
  sendNotification,
  validateAndNormalizeProjectedReturn,
} from "@/utils/server";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { newInvestmentEmail } from "@/templates/emails";
import User from "@/models/User";
import { NextRequest } from "next/server";
import { pusherServer } from "@/lib/pusher-server";
import { formatProjectedReturn, ProjectedReturn } from "@/lib/utils";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    const mode = searchParams.get("mode") || "advanced"; // default to advanced
    if (mode === "simple") {
      const products = await Product.find()
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .lean();

      const formattedProducts = products.map((product) => ({
        ...product,
        category: product.category?.name || null,
      }));

      return sendSuccessResponse(
        200,
        "Products fetched successfully!",
        formattedProducts
      );
    }

    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const filter = search ? { title: { $regex: search, $options: "i" } } : {};

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Replace category object with just the name
    const formattedProducts = products.map((product) => ({
      ...product,
      category: product.category?.name || null,
    }));

    return sendSuccessResponse(
      200,
      "Products fetched successfully!",
      formattedProducts
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const decoded: any = await loggedIn();

    const body = await req.json();

    const {
      title,
      tagline,
      description,
      category: categoryName,
      isDraft,
      status,
      currentValue,
      expectedValue,
      projectedReturn: ProjectedReturn,
      minInvestment,
      subscriptionFee,
      managementFee,
      performanceFee,
      activationDate,
      expirationDate,
      commitmentDeadline,
      investmentDuration,
      state,
      area,
      terms,
      featuredImage,
      video,
      galleryImages = [],
      docs = [],
      faqs = [],
    } = body;

    const finalStatus = isDraft ? false : status;

    // 1. Find category
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return sendErrorResponse(404, "Category not found");
    }

    // 2) Validate + normalize projectedReturn
    let normalizedProjectedReturn: ProjectedReturn | undefined = undefined;
    if (ProjectedReturn != null) {
      try {
        normalizedProjectedReturn =
          validateAndNormalizeProjectedReturn(ProjectedReturn);
      } catch (e: any) {
        return sendErrorResponse(400, e?.message || "Invalid projectedReturn");
      }
    }

    // 3. Clean FAQs
    const cleanedFaqs = Array.isArray(faqs)
      ? faqs.filter((faq) => faq.question?.trim() || faq.answer?.trim())
      : [];

    // 4. Generate productId
    const categoryPrefix = categoryName.slice(0, 2).toUpperCase();
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const productCount = await Product.countDocuments({});
    const rawCount = productCount + 1;

    const paddedCount =
      rawCount < 10
        ? `000${rawCount}`
        : rawCount < 100
          ? `00${rawCount}`
          : rawCount < 1000
            ? `0${rawCount}`
            : `${rawCount}`;

    const productId = `${categoryPrefix}${year}${month}${paddedCount}`;

    // 5. Create product
    const newProduct = new Product({
      productId,
      title,
      tagline,
      description,
      category: category._id,
      isDraft,
      isPublished: !isDraft,
      status: finalStatus,
      currentValue,
      expectedValue,
      projectedReturn: normalizedProjectedReturn,
      minInvestment,
      subscriptionFee,
      managementFee,
      performanceFee,
      activationDate,
      expirationDate,
      commitmentDeadline,
      investmentDuration,
      state,
      area,
      terms,
      featuredImage: featuredImage || null,
      video: video || null,
      galleryImages,
      docs,
      faqs: cleanedFaqs,
    });

    await newProduct.save();

    const productObject = newProduct.toObject();
    productObject.category = category.name;

    const users = await User.find({ email: { $ne: decoded.email } });

    if (!isDraft) {
      for (const user of users) {
        const notify = {
          title: "Ready for Your Next Investment?",
          message: `New investment ${productObject.title} has launched in the system. Check it out.`,
          type: "info",
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/investments/${productObject._id}`,
        };

        // await sendNotification(user.email, notify);

        // await pusherServer.trigger(`user-${user.email}`, "new-notification", {
        //   ...notify,
        //   timestamp: new Date(),
        // });

        const { firstName, lastName, email } = user;
        const investmentId = productObject._id;

        // await newInvestmentEmail(
        //   {
        //     firstName,
        //     lastName,
        //     email,
        //     title: productObject.title,
        //     projectedReturn: formatProjectedReturn(
        //       productObject.projectedReturn
        //     ), // ✅ now a string
        //     investmentDuration: productObject.investmentDuration,
        //     investmentId,
        //   },
        //   "New Investment Opportunity - Capital M"
        // );
      }
    }

    return sendSuccessResponse(
      201,
      "Investment added successfully!",
      productObject
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
