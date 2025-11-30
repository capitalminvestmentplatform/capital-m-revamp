import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import Statement from "@/models/Statement";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;

    const notice = await Statement.findById(id);
    if (!notice) {
      return sendErrorResponse(404, "Statement not found");
    }

    await Statement.findByIdAndDelete(id);

    return sendSuccessResponse(200, "Statement deleted successfully");
  } catch (error) {
    return sendErrorResponse(500, "Failed to delete statement", error);
  }
}
