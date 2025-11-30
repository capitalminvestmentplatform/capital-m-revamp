import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";

import { parseForm, processTiptapImages } from "@/utils/server";
import { NextRequest } from "next/server";
import Category from "@/models/Category";

// Accepts productId from the route like: /api/products/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const productId = id;

    const product = await Product.findById(productId)
      .populate("category", "name")
      .lean(); // Important to get plain object

    if (!product) {
      return sendErrorResponse(404, "Product not found");
    }

    // 👇 Replace category object with just the name
    const formattedProduct = {
      ...product,
      category: (product as any).category?.name || null,
    };

    return sendSuccessResponse(
      200,
      "Product fetched successfully",
      formattedProduct
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const productId = id;

    const updated = await Product.findByIdAndUpdate(
      productId,
      { status: false },
      { new: true }
    );

    if (!updated) {
      return sendErrorResponse(404, "Product not found");
    }

    return sendSuccessResponse(200, "product deleted successfully");
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

    const body = await req.json();
    const { id } = await params;
    const productId = id;

    let product = await Product.findById(productId);
    if (!product) {
      return sendErrorResponse(404, "Product not found");
    }

    // Destructure and clean input
    const {
      title,
      tagline,
      description,
      category: categoryName,
      currentValue,
      expectedValue,
      projectedReturn,
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
      status,
      isDraft,
    } = body;

    // Convert category name to ObjectId
    let categoryId = product.category;
    if (categoryName) {
      const categoryDoc = await Category.findOne({ name: categoryName });
      if (!categoryDoc) {
        return sendErrorResponse(404, "Category not found");
      }
      categoryId = categoryDoc._id;
    }

    // Process tiptap description
    let cleanedDescription = description;
    if (typeof cleanedDescription === "string") {
      cleanedDescription = await processTiptapImages(
        cleanedDescription,
        `investments/${title}/description`
      );
    }

    // Filter valid FAQs
    const cleanedFaqs = Array.isArray(faqs)
      ? faqs.filter((faq) => faq.question?.trim() || faq.answer?.trim())
      : [];

    // Prepare updated payload
    const updatedData = {
      title,
      tagline,
      description: cleanedDescription,
      category: categoryId,
      currentValue,
      expectedValue,
      projectedReturn,
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
      status,
      isDraft,
    };

    await Product.findByIdAndUpdate(productId, updatedData, { new: true });

    return sendSuccessResponse(200, "Product updated successfully");
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
