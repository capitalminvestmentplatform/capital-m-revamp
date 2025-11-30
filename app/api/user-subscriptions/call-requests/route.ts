import { connectToDatabase } from "@/lib/db";
import { pusherServer } from "@/lib/pusher-server";
import CallRequest from "@/models/CallRequest";
import Product from "@/models/Product";
import User from "@/models/User";
import { callRequestAdminEmail } from "@/templates/emails";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn, sendNotification } from "@/utils/server";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all products and populate the category field (only 'name')
    const callRequests = await CallRequest.find()
      .sort({ createdAt: -1 })
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
    const formattedCallRequests = callRequests.map((c) => {
      const { userId, pId, ...rest } = c;

      return {
        ...rest,
        username: `${userId?.firstName || ""} ${userId?.lastName || ""}`.trim(),
        email: userId?.email || "",
        clientCode: userId?.clientCode || "",
        title: pId?.title || "",
        thumbnail: pId?.featuredImage || "",
        productId: pId?.productId || "",
      };
    });

    return sendSuccessResponse(
      200,
      "Call requests fetched successfully!",
      formattedCallRequests
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { pId, phone, message } = await req.json();

    const decoded: any = await loggedIn();

    const product = await Product.findById(pId);
    const { title } = product;

    let user = null;

    user = await User.findById(decoded.id);

    const { email, clientCode, firstName, lastName } = user;

    const callRequest = new CallRequest({
      pId,
      userId: decoded.id,
      phone,
      message,
    });

    await callRequest.save();

    const notify = {
      title: "Someone Wants to Connect!",
      message: `New call request is added for the product: ${title} by ${firstName} ${lastName}.`,
      type: "info",
    };

    const users = await User.find({
      role: "Admin",
    });

    for (const user of users) {
      await sendNotification(user.email, notify);

      await pusherServer.trigger(`user-${user.email}`, "new-notification", {
        ...notify,
        timestamp: new Date(),
      });

      const username = `${firstName} ${lastName}`;
      const userEmail = email;
      const { email: adminEmail } = user;

      await callRequestAdminEmail(
        {
          username,
          userEmail,
          adminEmail,
          clientCode,
          title,
          phone,
          message,
        },
        `Call Request received for ${title} - Capital M`
      );
    }

    return sendSuccessResponse(
      201,
      "Call request added successfully!",
      callRequest
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
