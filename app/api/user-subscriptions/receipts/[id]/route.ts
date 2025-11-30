import { connectToDatabase } from "@/lib/db";
import CapitalCall from "@/models/CapitalCall";
import Receipt from "@/models/Receipt";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn } from "@/utils/server";
import { NextRequest } from "next/server";

// Accepts capitalCallId from the route like: /api/products/[id]

export async function DELETE(
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

    const receipt = await Receipt.findByIdAndDelete(id);

    if (!receipt) {
      return sendErrorResponse(404, "Receipt not found");
    }

    return sendSuccessResponse(200, "Receipt deleted successfully");
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const receiptId = id;

    const receipt = await Receipt.findById(receiptId)
      .populate({
        path: "pId",
        select: "productId title commitmentDeadline",
      })
      .populate({
        path: "userId",
        select: "firstName lastName clientCode email phone",
      })
      .populate({
        path: "commitmentId",
        select: "commitmentAmount status",
      })
      .lean();

    if (!receipt || Array.isArray(receipt)) {
      return sendErrorResponse(404, "Receipt not found");
    }

    const { userId, pId, commitmentId, ...rest } = receipt;

    const formattedReceipt = {
      ...rest,
      username: `${userId?.firstName || ""} ${userId?.lastName || ""}`.trim(),
      email: userId?.email || "",
      clientCode: userId?.clientCode || "",
      phone: userId?.phone || "",
      commitmentAmount: commitmentId?.commitmentAmount || 0,
      status: commitmentId?.status || 0,
      commitmentDeadline: pId?.commitmentDeadline || 0,
      title: pId?.title || "",
      productId: pId?.productId || "",
    };

    return sendSuccessResponse(
      200,
      "Receipt fetched successfully",
      formattedReceipt
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
