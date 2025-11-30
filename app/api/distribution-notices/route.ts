import { connectToDatabase } from "@/lib/db";
import { pusherServer } from "@/lib/pusher-server";
import DistributionNotice from "@/models/DistributionNotice";
import User from "@/models/User";
import { distributionNoticeEmail } from "@/templates/emails";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn, sendNotification } from "@/utils/server";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all products and populate the category field (only 'name')
    const distributionNotices = await DistributionNotice.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        select: "firstName lastName clientCode email", // grab raw fields
      })
      .lean();

    const formattedDistributionNotices = distributionNotices.map((c) => {
      const { userId, pId, ...rest } = c;

      return {
        ...rest,
        username: `${userId?.firstName || ""} ${userId?.lastName || ""}`.trim(),
        email: userId?.email || "",
        clientCode: userId?.clientCode || "",
      };
    });

    return sendSuccessResponse(
      200,
      "Distribution Notices fetched successfully!",
      formattedDistributionNotices
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const {
      userId,
      commitmentName,
      distributionDate,
      distributionAmount,
      description,
      pdf,
    } = await req.json();

    let user = null;

    user = await User.findById(userId);

    const { email, clientCode, firstName, lastName } = user;

    const distributionNotice = new DistributionNotice({
      userId,
      commitmentName,
      distributionDate,
      distributionAmount,
      description,
      pdf,
    });

    await distributionNotice.save();

    const notify = {
      title: "You've Got a New Distribution Notice",
      message: `New distribution notice is added against your commitment: ${commitmentName}`,
      type: "info",
    };

    await sendNotification(email, notify);

    await pusherServer.trigger(`user-${email}`, "new-notification", {
      ...notify,
      timestamp: new Date(),
    });

    const date = new Date(distributionDate);
    const formattedDate = date.toISOString().split("T")[0]; // "2025-03-20"

    await distributionNoticeEmail(
      {
        firstName,
        lastName,
        email,
        clientCode,
        commitmentName,
        distributionAmount,
        description,
        attachment: {
          file: pdf,
          name: `Distribution Notice - ${formattedDate}.pdf`,
        },
      },
      `Distribution Notice - ${formattedDate} - Capital M`
    );

    return sendSuccessResponse(
      201,
      "Distribution Notice added successfully!",
      distributionNotice
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
