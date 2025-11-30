import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import MalcoAsset from "@/models/malco/MalcoAsset";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { Types } from "mongoose";
import MalcoCategory from "@/models/malco/MalcoCategory";
import MalcoSubcategory from "@/models/malco/MalcoSubCategory";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "admin" or undefined

    const filter: any = {};

    if (type === "admin") {
      filter.byAdmin = true;
    }

    const malcoAssets = await MalcoAsset.find(filter)
      .sort({ assetName: 1 }) // fixed: use assetName instead of name
      .lean();

    return sendSuccessResponse(
      200,
      "Malco assets fetched successfully",
      malcoAssets
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
      assetName,
      longName,
      category, // ObjectId string for MalcoCategory
      subCategory, // ObjectId string for MalcoSubcategory
      isin,
      pandaId, // number (optional)
      byAdmin, // boolean (optional)
    } = body || {};

    // Required fields
    if (!assetName || !category || !subCategory) {
      return sendErrorResponse(
        400,
        "assetName, category, and subCategory are required"
      );
    }

    // Validate ObjectIds
    if (
      !Types.ObjectId.isValid(category) ||
      !Types.ObjectId.isValid(subCategory)
    ) {
      return sendErrorResponse(400, "Invalid category or subCategory id");
    }

    // Validate category/subCategory existence and linkage (subcategory belongs to category)
    const [catDoc, subCatDoc] = await Promise.all([
      MalcoCategory.findById(category).lean(),
      MalcoSubcategory.findById(subCategory).lean(),
    ]);
    if (!catDoc) return sendErrorResponse(404, "Category not found");
    if (!subCatDoc) return sendErrorResponse(404, "Subcategory not found");
    // if (subCatDoc.category && String(subCatDoc.category) !== String(category)) {
    //   return sendErrorResponse(
    //     400,
    //     "Selected subcategory does not belong to the selected category"
    //   );
    // }

    const nameRegex = buildLooseNameRegex(assetName);

    const existing = await MalcoAsset.findOne({
      subCategory,
      assetName: { $regex: nameRegex }, // Mongoose will convert this correctly
    }).lean();

    if (existing) {
      return sendErrorResponse(
        409,
        "Asset with this name already exists in the selected subcategory"
      );
    }

    const doc = await MalcoAsset.create({
      assetName: assetName.trim(),
      longName: (longName ?? "").trim(),
      category,
      subCategory,
      isin: (isin ?? "").trim(),
      pandaId:
        typeof pandaId === "number" && !Number.isNaN(pandaId)
          ? pandaId
          : undefined,
      byAdmin: typeof byAdmin === "boolean" ? byAdmin : false,
    });

    return sendSuccessResponse(201, "Malco asset created successfully", doc);
  } catch (error) {
    // Handle unique index violation cleanly
    if (error?.code === 11000) {
      return sendErrorResponse(
        409,
        "Asset with this name already exists in the selected subcategory"
      );
    }
    return sendErrorResponse(500, "Internal server error", error);
  }
}
function buildLooseNameRegex(name: string) {
  const norm = name
    .normalize("NFKC") // normalize unicode (handles NBSP, etc.)
    .trim()
    .replace(/\s+/g, " "); // collapse spaces for the pattern base

  const escaped = norm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = "^" + escaped.replace(/\s+/g, "\\s+") + "$"; // allow any whitespace runs
  return new RegExp(pattern, "i"); // case-insensitive
}
