import { connectToDatabase } from "@/lib/db";
import CapitalCall from "@/models/CapitalCall";
import Subscription from "@/models/Subscription";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all products and populate the category field (only 'name')
    const capitalCalls = await CapitalCall.find()
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
    const formattedCapitalCalls = capitalCalls.map((s) => {
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
      "Capital calls fetched successfully!",
      formattedCapitalCalls
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { subscriptionId } = await req.json();

    const subscription = await Subscription.findById(subscriptionId);
    const { pId, userId, commitmentId } = subscription;

    const capitalCall = new CapitalCall({
      pId,
      userId,
      commitmentId,
    });

    await capitalCall.save();

    subscription.capitalCall = true;
    await subscription.save();

    return sendSuccessResponse(
      201,
      "Capital Call created successfully!",
      capitalCall
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
