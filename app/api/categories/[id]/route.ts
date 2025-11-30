import { connectToDatabase } from "@/lib/db";
import Category from "@/models/Category";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { NextRequest } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return sendErrorResponse(400, "Category name is required");
    }

    const category = await Category.findById(id);

    if (!category) {
      return sendErrorResponse(404, "Category not found");
    }

    category.name = name;
    await category.save();

    return sendSuccessResponse(200, "Category updated successfully!", category);
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;

    const category = await Category.findById(id);

    if (!category) {
      return sendErrorResponse(404, "Category not found");
    }

    await Category.findByIdAndDelete(id);

    return sendSuccessResponse(200, "Category deleted successfully!");
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
