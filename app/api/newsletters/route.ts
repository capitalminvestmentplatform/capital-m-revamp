import { connectToDatabase } from "@/lib/db";
import { pusherServer } from "@/lib/pusher-server";
import Category from "@/models/Category";
import NewsLetter from "@/models/NewsLetter";
import Product from "@/models/Product";
import Statement from "@/models/Statement";
import User from "@/models/User";
import { newsletterEmail, statementEmail } from "@/templates/emails";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { sendNotification } from "@/utils/server";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all products and populate the category field (only 'name')
    const newsletters = await NewsLetter.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "pId",
        select: "title", // grab raw fields
      })
      .populate({
        path: "cId",
        select: "name", // grab raw fields
      })
      .lean();

    const formattedNewsletters = newsletters.map((c) => {
      const { pId, cId, ...rest } = c;

      return {
        ...rest,
        investment: pId?.title || "",
        category: cId?.name || "",
      };
    });

    return sendSuccessResponse(
      200,
      "Newsletters fetched successfully!",
      formattedNewsletters
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { subject, description, category, pId, users } = await req.json();

    // Find product title using pId
    const product = await Product.findById(pId);
    if (!product) {
      return Response.json({ message: "Product not found", statusCode: 404 });
    }

    // Find category ID using name
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return Response.json({ message: "Category not found", statusCode: 404 });
    }

    // Find user IDs from provided usernames/emails/_ids
    const matchedUsers = await User.find({ _id: { $in: users } });

    if (matchedUsers.length !== users.length) {
      return Response.json({
        message: "One or more users not found",
        statusCode: 400,
      });
    }

    const newsletter = new NewsLetter({
      subject,
      description,
      pId: product._id,
      cId: categoryDoc._id,
      userId: matchedUsers.map((user) => user._id),
    });

    await newsletter.save();

    const notify = {
      title: "You've Got a Newsletter",
      message: `Newsletter is sent by admin, check your email for details.`,
      type: "info",
    };

    for (const user of matchedUsers) {
      await sendNotification(user.email, notify);

      await pusherServer.trigger(`user-${user.email}`, "new-notification", {
        ...notify,
        timestamp: new Date(),
      });

      await newsletterEmail(
        {
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          category,
          investmentTitle: product.title,
          subject,
          description,
        },
        `${subject} - Capital M`
      );
    }

    return sendSuccessResponse(
      201,
      "Newsletter added successfully!",
      newsletter
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
