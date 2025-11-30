import {
  nomineeAgreementHTML,
  termsOfSubscriptionHTML,
} from "@/data/subscription";
import { connectToDatabase } from "@/lib/db";
import Commitment from "@/models/Commitment";
import Subscription from "@/models/Subscription";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all products and populate the category field (only 'name')
    const subscriptions = await Subscription.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "commitmentId",
        select: "commitmentAmount status", // grab raw fields
      })
      .populate({
        path: "userId",
        select: "firstName lastName clientCode email", // grab raw fields
      })
      .populate({
        path: "pId",
        select: "title featuredImage productId", // raw fields
      })
      .lean();

    // Post-process each commitment
    const formattedSubscriptions = subscriptions.map((s) => {
      const { userId, pId, commitmentId, ...rest } = s;

      return {
        ...rest,
        username: `${userId?.firstName || ""} ${userId?.lastName || ""}`.trim(),
        clientCode: userId?.clientCode || "",
        email: userId?.email || "",
        title: pId?.title || "",
        thumbnail: pId?.featuredImage || "",
        productId: pId?.productId || "",
        commitmentAmount: commitmentId?.commitmentAmount || 0,
        status: commitmentId?.status,
      };
    });

    return sendSuccessResponse(
      200,
      "Subscriptions fetched successfully!",
      formattedSubscriptions
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { commitmentId } = await req.json();

    const commitment = await Commitment.findById(commitmentId);
    const { pId, userId } = commitment;

    const subscription = new Subscription({
      pId,
      userId,
      commitmentId,
      terms: termsOfSubscriptionHTML,
      statements: nomineeAgreementHTML,
      sign: "",
      signedSubscription: "",
    });

    await subscription.save();

    return sendSuccessResponse(
      201,
      "Subscription created successfully!",
      subscription
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
