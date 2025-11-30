import { connectToDatabase } from "@/lib/db";
import Category from "@/models/Category";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const categories = await Category.find().sort({ name: 1 }).lean();

    return sendSuccessResponse(
      200,
      "categories fetched successfully!",
      categories
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return sendErrorResponse(400, "Category name is required");
    }

    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      return sendErrorResponse(409, "Category already exists");
    }

    const category = await Category.create({ name });

    return sendSuccessResponse(201, "Category created successfully!", category);
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
