import { connectToDatabase } from "@/lib/db";
import { pusherServer } from "@/lib/pusher-server";
import DistributionNotice from "@/models/DistributionNotice";
import User from "@/models/User";
import { distributionNoticeEmail } from "@/templates/emails";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn, sendNotification } from "@/utils/server";
import mongoose from "mongoose";
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

type NoticeInput = {
  userId: string;
  commitmentName?: string;
  distributionDate: string | Date;
  distributionAmount: number;
  description?: string;
  pdf?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { distributionNotices } = (await req.json()) as {
      distributionNotices: NoticeInput[];
    };
    if (
      !Array.isArray(distributionNotices) ||
      distributionNotices.length === 0
    ) {
      return sendErrorResponse(400, "distributionNotices array is required");
    }
    const invalid = distributionNotices.find((n) => {
      const validId = mongoose.Types.ObjectId.isValid(n.userId);
      const validAmount =
        typeof n.distributionAmount === "number" && n.distributionAmount >= 0;
      const validDate = !!n.distributionDate;

      return !validId || !validAmount || !validDate;
    });

    if (invalid) {
      return sendErrorResponse(
        400,
        "Each row must include valid userId, distributionAmount, and distributionDate"
      );
    }

    const userIds = [...new Set(distributionNotices.map((n) => n.userId))];

    const users = await User.find({ _id: { $in: userIds } })
      .select("email clientCode firstName lastName")
      .lean();

    const userMap = new Map<string, any>();
    users.forEach((u: any) => userMap.set(u._id.toString(), u));

    const missingUserIds = userIds.filter((id) => !userMap.has(id));
    if (missingUserIds.length > 0) {
      return sendErrorResponse(
        404,
        `User(s) not found: ${missingUserIds.join(", ")}`
      );
    }

    const docsToInsert = distributionNotices.map((n) => ({
      userId: n.userId,
      commitmentName: n.commitmentName ?? null,
      distributionDate: new Date(n.distributionDate),
      distributionAmount: n.distributionAmount,
      description: n.description ?? "",
      pdf: n.pdf?.trim() ? n.pdf.trim() : null,
    }));

    const created = await DistributionNotice.insertMany(docsToInsert, {
      ordered: true,
    });

    const results = await Promise.allSettled(
      created.map(async (notice: any) => {
        const user = userMap.get(notice.userId.toString());
        const { email, clientCode, firstName, lastName } = user;
        const { commitmentName, distributionAmount, description, pdf } = notice;
        const cName = commitmentName || "N/A";

        const notify = {
          title: "You've Got a New Distribution Notice",
          message: `New distribution notice is added against your commitment: ${cName}`,
          type: "info",
        };

        await sendNotification(email, notify);

        await pusherServer.trigger(`user-${email}`, "new-notification", {
          ...notify,
          timestamp: new Date(),
        });

        const d = new Date(notice.distributionDate);
        const formattedDate = d.toISOString().split("T")[0];

        await distributionNoticeEmail(
          {
            firstName,
            lastName,
            email,
            clientCode,
            distributionAmount,
            description,
            attachment: {
              file: pdf,
              name: `Distribution Notice - ${formattedDate}.pdf`,
            },
          },
          `Distribution Notice - ${formattedDate} - Capital M`
        );
      })
    );

    const failed = results.filter((r) => r.status === "rejected").length;

    return sendSuccessResponse(
      201,
      "Distribution Notices added successfully!",
      {
        createdCount: created.length,
        notificationsEmailsFailed: failed,
        notices: created,
      }
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
