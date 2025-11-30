import { connectToDatabase } from "@/lib/db";
import Notification from "@/models/Notification";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const notificationId = id;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return sendErrorResponse(404, "Notification not found");
    }

    return sendSuccessResponse(
      200,
      "Notification marked as read",
      notification
    );
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
    const notificationId = id;
    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return sendErrorResponse(404, "Notification not found");
    }

    return sendSuccessResponse(200, "Notification deleted successfully");
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
