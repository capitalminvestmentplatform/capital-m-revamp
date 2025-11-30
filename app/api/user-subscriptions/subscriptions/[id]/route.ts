import { connectToDatabase } from "@/lib/db";
import Subscription from "@/models/Subscription";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn } from "@/utils/server";
import { NextRequest } from "next/server";

// Accepts subscriptionId from the route like: /api/products/[id]

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const decoded: any = await loggedIn();
    if (!decoded || decoded.role !== "Admin") {
      return sendErrorResponse(403, "Unauthorized access");
    }

    const subscription = await Subscription.findByIdAndDelete(id);

    if (!subscription) {
      return sendErrorResponse(404, "Subscription not found");
    }

    return sendSuccessResponse(200, "Subscription deleted successfully");
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
    const subscriptionId = id;

    const subscription = await Subscription.findById(subscriptionId)
      .populate({
        path: "pId",
        select:
          "productId commitmentDeadline title category subscriptionFee managementFee performanceFee projectedReturn investmentDuration createdAt area state",
      })
      .populate({
        path: "userId",
        select: "firstName lastName clientCode email phone",
      })
      .populate({
        path: "commitmentId",
        select: "commitmentAmount status",
      })
      .lean();

    if (!subscription || Array.isArray(subscription)) {
      return sendErrorResponse(404, "Subscription not found");
    }

    const { userId, pId, commitmentId, ...rest } = subscription;

    const formattedSubscription = {
      ...rest,
      username: `${userId?.firstName || ""} ${userId?.lastName || ""}`.trim(),
      email: userId?.email || "",
      clientCode: userId?.clientCode || "",
      phone: userId?.phone || "",
      commitmentAmount: commitmentId?.commitmentAmount || 0,
      status: commitmentId?.status,
      title: pId?.title || "",
      productId: pId?.productId || "",
      address: `${pId?.area || ""}, ${pId?.state || ""}`.trim(),
      commitmentDeadline: pId?.commitmentDeadline || "",
      category: pId?.category || "",
      subscriptionFee: pId?.subscriptionFee || "",
      managementFee: pId?.managementFee || "",
      performanceFee: pId?.performanceFee || "",
      projectedReturn: pId?.projectedReturn || "",
      investmentDuration: pId?.investmentDuration || "",
      createdAt: pId?.createdAt || "",
    };

    return sendSuccessResponse(
      200,
      "Subscription fetched successfully",
      formattedSubscription
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
