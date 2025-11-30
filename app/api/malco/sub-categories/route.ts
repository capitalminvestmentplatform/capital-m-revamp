import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import MalcoSubcategory from "@/models/malco/MalcoSubCategory";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    let subCategories: any = [];
    if (category) {
      subCategories = await MalcoSubcategory.find({ category })
        .sort({ name: 1 })
        .lean();
    } else {
      subCategories = await MalcoSubcategory.find().sort({ name: 1 }).lean();
    }

    return sendSuccessResponse(
      200,
      "Malco sub categories fetched successfully",
      subCategories
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
