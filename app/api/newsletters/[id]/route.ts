import { connectToDatabase } from "@/lib/db";
import Category from "@/models/Category";
import NewsLetter from "@/models/NewsLetter";
import Product from "@/models/Product";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn } from "@/utils/server";
import { NextRequest } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const newsletterId = id;
    await connectToDatabase();

    const decoded: any = await loggedIn();
    if (!decoded || decoded.role !== "Admin") {
      return sendErrorResponse(403, "Unauthorized access");
    }

    const newsletter = await NewsLetter.findByIdAndDelete(newsletterId);

    if (!newsletter) {
      return sendErrorResponse(404, "Newsletter not found");
    }

    return sendSuccessResponse(200, "Newsletter deleted successfully");
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const newsletterId = id;

    const newsletter = await NewsLetter.findById(newsletterId)
      .populate({
        path: "pId",
        select: "id title",
      })
      .populate({
        path: "cId",
        select: "name",
      })
      .lean();

    if (!newsletter || Array.isArray(newsletter)) {
      return sendErrorResponse(404, "Newsletter not found");
    }

    const { pId, cId, ...rest } = newsletter;

    const formattedNewsletter = {
      ...rest,
      investmentId: pId?._id || "",
      investmentTitle: pId?.title || "",
      category: cId?.name || "",
    };

    return sendSuccessResponse(
      200,
      "Newsletter fetched successfully",
      formattedNewsletter
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { subject, description, category, pId, users } = await req.json();
    const { id } = await params;
    const newsletterId = id;

    const newsletter = await NewsLetter.findById(newsletterId);
    if (!newsletter) {
      return sendErrorResponse(404, "Newsletter not found");
    }

    // Find product by pId
    const product = await Product.findById(pId);
    if (!product) {
      return sendErrorResponse(404, "Product not found");
    }

    // Find category by name
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return sendErrorResponse(404, "Category not found");
    }

    // Validate users (optional)
    const matchedUsers = await User.find({ _id: { $in: users } });
    if (matchedUsers.length !== users.length) {
      return sendErrorResponse(400, "One or more users not found");
    }

    // Update newsletter fields
    newsletter.subject = subject;
    newsletter.description = description;
    newsletter.pId = product._id;
    newsletter.cId = categoryDoc._id;
    newsletter.userId = matchedUsers.map((u) => u._id);

    await newsletter.save();

    return sendSuccessResponse(
      200,
      "Newsletter updated successfully",
      newsletter
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
