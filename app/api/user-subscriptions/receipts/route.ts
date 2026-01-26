import { connectToDatabase } from "@/lib/db";
import CapitalCall from "@/models/CapitalCall";
import Receipt from "@/models/Receipt";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const receipts = await Receipt.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "commitmentId",
        select: "commitmentAmount status",
      })
      .populate({
        path: "userId",
        select: "firstName lastName clientCode email",
      })
      .populate({
        path: "pId",
        select: "title featuredImage productId",
      })
      .lean();

    const formattedReceipts = receipts.map((s) => {
      const { userId, pId, commitmentId, commitmentAmount, ...rest } = s;

      return {
        ...rest,

        // user info
        username: `${userId?.firstName || ""} ${userId?.lastName || ""}`.trim(),
        clientCode: userId?.clientCode || "",
        email: userId?.email || "",

        // product info
        title: pId?.title || "",
        thumbnail: pId?.featuredImage || "",
        productId: pId?.productId || "",

        // commitment handling (IMPORTANT FIX)
        commitmentAmount:
          commitmentId?.commitmentAmount ?? commitmentAmount ?? 0,

        status: commitmentId?.status ?? rest?.status,
      };
    });

    return sendSuccessResponse(
      200,
      "Receipts fetched successfully!",
      formattedReceipts
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { capitalCallId } = await req.json();

    const capitalCall = await CapitalCall.findById(capitalCallId);
    const { pId, userId, commitmentId } = capitalCall;

    // Generate productId
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2); // e.g. "25"
    const month = String(now.getMonth() + 1).padStart(2, "0"); // e.g. "04"
    const receiptCount = await Receipt.countDocuments({});
    const rawCount = receiptCount + 1;

    const paddedCount =
      rawCount < 10
        ? `000${rawCount}`
        : rawCount < 100
          ? `00${rawCount}`
          : rawCount < 1000
            ? `0${rawCount}`
            : `${rawCount}`;

    const receiptId = `REC-${year}${month}${paddedCount}`;

    const receipt = new Receipt({
      pId,
      userId,
      commitmentId,
      receiptId,
    });

    await receipt.save();
    capitalCall.receipt = true;
    await capitalCall.save();

    return sendSuccessResponse(201, "Receipt created successfully!", receipt);
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
