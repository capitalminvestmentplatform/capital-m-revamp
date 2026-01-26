import { connectToDatabase } from "@/lib/db";
import { pusherServer } from "@/lib/pusher-server";
import Receipt from "@/models/Receipt";
import User from "@/models/User";
import { receiptSendToClientEmail } from "@/templates/emails";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn, sendNotification } from "@/utils/server";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

type ReceiptInput = {
  userId: string;
  commitmentName?: string;
  createdAt: string | Date;
  commitmentAmount: number;
  receiptId: string;
  pdf?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { receipts } = (await req.json()) as {
      receipts: ReceiptInput[];
    };
    if (!Array.isArray(receipts) || receipts.length === 0) {
      return sendErrorResponse(400, "receipts array is required");
    }
    const invalid = receipts.find((n) => {
      const validId = mongoose.Types.ObjectId.isValid(n.userId);
      const validAmount =
        typeof n.commitmentAmount === "number" && n.commitmentAmount >= 0;

      return !validId || !validAmount;
    });

    if (invalid) {
      return sendErrorResponse(
        400,
        "Each row must include valid userId, commitmentAmount, and createdAt"
      );
    }

    const userIds = [...new Set(receipts.map((n) => n.userId))];
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

    const docsToInsert = receipts.map((n) => ({
      userId: n.userId,
      commitmentName: n.commitmentName ?? null,
      commitmentAmount: n.commitmentAmount,
      receiptId: n.receiptId,
      pdf: n.pdf?.trim() ? n.pdf.trim() : null,
      send: true,
    }));

    const created = await Receipt.insertMany(docsToInsert, {
      ordered: true,
    });

    const results = await Promise.allSettled(
      created.map(async (receipt: any) => {
        const user = userMap.get(receipt.userId.toString());
        const { email, clientCode, firstName, lastName } = user;
        const {
          commitmentName,
          commitmentAmount,
          receiptId,
          pdf,
          id,
          createdAt,
        } = receipt;
        const cName = commitmentName || "N/A";

        const notify = {
          title: "You've Got a New Receipt",
          message: `New receipt is added against your commitment: ${cName}`,
          type: "info",
        };

        await sendNotification(email, notify);

        await pusherServer.trigger(`user-${email}`, "new-notification", {
          ...notify,
          timestamp: new Date(),
        });

        const d = new Date(receipt.distributionDate);
        const formattedDate = d.toISOString().split("T")[0];
        const username = `${firstName || ""} ${lastName || ""}`.trim();
        await receiptSendToClientEmail(
          {
            username,
            email,
            receiptId,
            commitmentAmount,
            createdAt,
            id,
            attachment: {
              file: pdf,
              name: `Receipt - ${formattedDate}.pdf`,
            },
          },
          `Receipt - ${formattedDate} - Capital M`
        );
      })
    );

    const failed = results.filter((r) => r.status === "rejected").length;

    return sendSuccessResponse(201, "Receipts added successfully!", {
      createdCount: created.length,
      notificationsEmailsFailed: failed,
      receipts: created,
    });
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
