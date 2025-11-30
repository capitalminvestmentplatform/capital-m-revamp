import { connectToDatabase } from "@/lib/db";
import { pusherServer } from "@/lib/pusher-server";
import CapitalCall from "@/models/CapitalCall";
import { capitalCallSendToClientEmail } from "@/templates/emails";
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

      bankName,
      accountName,
      IBAN,
      accountNumber,
      swiftCode,
      branch,
    } = await req.json();

    const updatedCapitalCall = await CapitalCall.findByIdAndUpdate(
      id,
      {
        send: true,
        pdf,
        bankName,
        accountName,
        IBAN,
        accountNumber,
        swiftCode,
        branch,
      },
      { new: true }
    );

    if (!updatedCapitalCall) {
      return sendErrorResponse(404, "Capital Call not found");
    }

    const notify = {
      title: "You've Got a New Capital Call",
      message: `New Capital Call has been sent to you against product: ${title}`,
      type: "info",
    };

    await sendNotification(email, notify);

    await pusherServer.trigger(`user-${email}`, "new-notification", {
      ...notify,
      timestamp: new Date(),
    });
    const capitalCallId = id;
    const date = new Date();
    const monthYear = date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    }); // e.g., "Dec 2025"

    await capitalCallSendToClientEmail(
      {
        username,
        email,
        title,
        capitalCallId,
        commitmentAmount,
        bankName,
        accountName,
        IBAN,
        accountNumber,
        swiftCode,
        branch,
        attachment: {
          file: pdf,
          name: `Capital Call - ${monthYear}.pdf`,
        },
      },
      `New Capital Call has been sent to you - Capital M`
    );

    return sendSuccessResponse(
      200,
      "Sent to client successfully",
      updatedCapitalCall
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
