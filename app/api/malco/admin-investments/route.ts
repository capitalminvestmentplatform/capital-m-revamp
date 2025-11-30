import { connectToDatabase } from "@/lib/db";
import AdminInvestments from "@/models/malco/AdminInvestments";
import MalcoCategory from "@/models/malco/MalcoCategory";
import MalcoSubcategory from "@/models/malco/MalcoSubCategory";
import User from "@/models/User";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { Types } from "mongoose";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email"); // "admin" or undefined

    const filter: any = {
      email,
    };

    const adminInvestments = await AdminInvestments.find(filter)
      .sort({ userAsset: 1 }) // fixed: use assetName instead of name
      .lean();

    return sendSuccessResponse(
      200,
      "Admin investments fetched successfully",
      adminInvestments
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const {
      userAsset,
      categoryId, // ObjectId string for MalcoCategory
      subCategoryId, // ObjectId string for MalcoSubcategory
      userId, // ObjectId string for MalcoSubcategory
      marketValue, // ObjectId string for MalcoSubcategory
      costPrice, // ObjectId string for MalcoSubcategory
      initialCost, // ObjectId string for MalcoSubcategory
    } = body || {};

    // Validate ObjectIds
    if (
      !Types.ObjectId.isValid(categoryId) ||
      !Types.ObjectId.isValid(subCategoryId) ||
      !Types.ObjectId.isValid(userId)
    ) {
      return sendErrorResponse(
        400,
        "Invalid category or subCategory or user id"
      );
    }

    // Validate category/subCategory existence and linkage (subcategory belongs to category)
    const [catDoc, subCatDoc, userDoc] = await Promise.all([
      MalcoCategory.findById(categoryId).lean(),
      MalcoSubcategory.findById(subCategoryId).lean(),
      User.findById(userId).lean(),
    ]);
    if (!catDoc) return sendErrorResponse(404, "Category not found");
    if (!subCatDoc) return sendErrorResponse(404, "Subcategory not found");
    if (!userDoc) return sendErrorResponse(404, "User not found");

    const doc = await AdminInvestments.create({
      // userAsset: userAsset,
      // category: catDoc.name,
      // subCategory: subCatDoc.name,
      // marketValue,
      // costPrice,
      // initialCost,
      // email: userDoc.email,
      // clientCode: userDoc.clientCode,
    });

    return sendSuccessResponse(201, "User asset created successfully", doc);
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
