import KYC from "@/models/KYC";
import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const field = searchParams.get("field");

    const kycDoc = await KYC.findById(id);
    if (!kycDoc) {
      return sendErrorResponse(404, "KYC document not found");
    }

    if (
      field &&
      ["nationalId", "nationalPassport", "residenceProof"].includes(field)
    ) {
      let deletedField = "";
      // Unset a specific field
      await KYC.findByIdAndUpdate(id, { $unset: { [field]: "" } });
      if (field === "nationalId") deletedField = "National ID";
      else if (field === "nationalPassport") deletedField = "National Passport";
      else if (field === "residenceProof") deletedField = "Residence Proof";

      return sendSuccessResponse(
        200,
        `Kyc doc: ${deletedField} deleted successfully`
      );
    } else {
      // Delete entire document
      await KYC.findByIdAndDelete(id);
      return sendSuccessResponse(200, "KYC documents deleted successfully");
    }
  } catch (error) {
    return sendErrorResponse(500, "Failed to delete KYC document", error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;

    const { nationalId, nationalPassport, residenceProof } = await req.json();

    const existing = await KYC.findById(id);
    if (!existing) {
      return sendErrorResponse(404, "KYC not found");
    }

    if (nationalId) {
      existing.nationalId = nationalId;
    }
    if (nationalPassport) {
      existing.nationalPassport = nationalPassport;
    }
    if (residenceProof) {
      existing.residenceProof = residenceProof;
    }

    const updated = await existing.save();

    return sendSuccessResponse(200, "KYC docs updated successfully", updated);
  } catch (error) {
    return sendErrorResponse(500, "Failed to update KYC docs", error);
  }
}
