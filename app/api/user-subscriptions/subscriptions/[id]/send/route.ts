import { connectToDatabase } from "@/lib/db";
import { pusherServer } from "@/lib/pusher-server";
import Subscription from "@/models/Subscription";
import { subscriptionSendToClientEmail } from "@/templates/emails";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn, sendNotification } from "@/utils/server";
import { NextRequest } from "next/server";

export async function PUT(
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

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      id,
      {
        send: true,
      },
      { new: true }
    );

    if (!updatedSubscription) {
      return sendErrorResponse(404, "Subscription not found");
    }

    const { email, username, productId, title } = await req.json();

    const notify = {
      title: "Subscription is Ready for Signature",
      message: `New subscription is added for your signature against product: ${title}`,
      type: "info",
    };

    await sendNotification(email, notify);

    await pusherServer.trigger(`user-${email}`, "new-notification", {
      ...notify,
      timestamp: new Date(),
    });
    const subscriptionId = id;
    await subscriptionSendToClientEmail(
      {
        username,
        email,
        title,
        productId,
        subscriptionId,
      },
      `New Subscription form has been added for your signatures - Capital M`
    );

    return sendSuccessResponse(
      200,
      "Sent to client successfully",
      updatedSubscription
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
