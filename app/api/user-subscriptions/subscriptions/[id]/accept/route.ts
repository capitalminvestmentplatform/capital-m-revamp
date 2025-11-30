import { connectToDatabase } from "@/lib/db";
import Subscription from "@/models/Subscription";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { NextRequest } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const updatedSubscription = await Subscription.findByIdAndUpdate(id, {
      new: true,
    });

    if (!updatedSubscription) {
      return sendErrorResponse(404, "Subscription not found");
    }

    return sendSuccessResponse(
      200,
      "Subscription accepted successfully",
      updatedSubscription
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
