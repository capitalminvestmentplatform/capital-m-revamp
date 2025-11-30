import { cookies } from "next/headers";
import Notification from "@/models/Notification";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn } from "@/utils/server";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccessResponse(
      200,
      "Notifications fetched successfully",
      notifications
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { to, title, message, type, url } = await req.json();

    const newNotification = new Notification({
      to,
      title,
      message,
      type,
      read: false,
      url,
    });
    await newNotification.save();

    return sendSuccessResponse(201, "Notification sent successfully");
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function PATCH() {
  try {
    await connectToDatabase();

    const decoded: any = await loggedIn();

    const user = await User.findById(decoded.id).lean();
    if (!user || !decoded.email) {
      return sendErrorResponse(404, "User not found");
    }

    await Notification.updateMany(
      { to: decoded.email, read: false },
      { $set: { read: true } }
    );

    return sendSuccessResponse(200, "All notifications marked as read");
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
export async function DELETE() {
  try {
    await connectToDatabase();

    const decoded: any = await loggedIn();

    const user = await User.findById(decoded.id).lean();
    if (!user || !decoded.email) {
      return sendErrorResponse(404, "User not found");
    }

    await Notification.deleteMany({ to: decoded.email });

    return sendSuccessResponse(200, "All notifications deleted successfully");
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
