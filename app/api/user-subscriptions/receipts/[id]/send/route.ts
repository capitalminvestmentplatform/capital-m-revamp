import { connectToDatabase } from "@/lib/db";
import { pusherServer } from "@/lib/pusher-server";
import Commitment from "@/models/Commitment";
import Receipt from "@/models/Receipt";
import { receiptSendToClientEmail } from "@/templates/emails";
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

    const {
      email,
      username,
      title,
      pdf,
      commitmentAmount,
      createdAt,
      receiptId,
    } = await req.json();

    const updatedReceipt = await Receipt.findByIdAndUpdate(
      id,
      {
        send: true,
        pdf,
      },
      { new: true }
    );

    if (!updatedReceipt) {
      return sendErrorResponse(404, "Receipt not found");
    }

    // Update associated commitment status to "Completed"
    if (updatedReceipt.commitmentId) {
      await Commitment.findByIdAndUpdate(updatedReceipt.commitmentId, {
        status: "Completed",
      });
    }

    const notify = {
      title: "You've Got a New Receipt",
      message: `New Receipt has been sent to you against product: ${title}`,
      type: "info",
    };

    await sendNotification(email, notify);

    await pusherServer.trigger(`user-${email}`, "new-notification", {
      ...notify,
      timestamp: new Date(),
    });

    const date = new Date();
    const monthYear = date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    }); // e.g., "Dec 2025"

    await receiptSendToClientEmail(
      {
        username,
        email,
        title,
        receiptId,
        commitmentAmount,
        createdAt,
        id,
        attachment: {
          file: pdf,
          name: `Receipt - ${monthYear}.pdf`,
        },
      },
      `New Receipt has been sent to you - Capital M`
    );

    return sendSuccessResponse(
      200,
      "Sent to client successfully",
      updatedReceipt
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
