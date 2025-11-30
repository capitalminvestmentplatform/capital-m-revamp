import { NextRequest } from "next/server";
import DistributionNotice from "@/models/DistributionNotice";
import { connectToDatabase } from "@/lib/db";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;

    const { distributionAmount, distributionDate, description, pdf } =
      await req.json();

    const existing = await DistributionNotice.findById(id);
    if (!existing) {
      return sendErrorResponse(404, "Distribution notice not found");
    }

    existing.distributionAmount = distributionAmount;
    existing.distributionDate = distributionDate;
    existing.description = description;
    if (pdf) {
      existing.pdf = pdf;
    }

    const updated = await existing.save();

    return sendSuccessResponse(
      200,
      "Distribution Notice updated successfully",
      updated
    );
  } catch (error) {
    return sendErrorResponse(
      500,
      "Failed to update distribution notice",
      error
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;

    const notice = await DistributionNotice.findById(id);
    if (!notice) {
      return sendErrorResponse(404, "Distribution notice not found");
    }

    await DistributionNotice.findByIdAndDelete(id);

    return sendSuccessResponse(200, "Distribution notice deleted successfully");
  } catch (error) {
    return sendErrorResponse(
      500,
      "Failed to delete distribution notice",
      error
    );
  }
}
