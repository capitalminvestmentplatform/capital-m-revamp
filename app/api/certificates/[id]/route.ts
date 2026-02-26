import { NextRequest, NextResponse } from "next/server";
import Certificate from "@/models/Certificate";
import { connectToDatabase } from "@/lib/db";

// PATCH /api/certificates/[id] — update the Google Drive URL only
// QR code URL stays the same — only the linked document changes
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();

    const { googleDriveUrl } = await request.json();

    if (!googleDriveUrl) {
      return NextResponse.json(
        { statusCode: 400, message: "googleDriveUrl is required" },
        { status: 400 },
      );
    }

    const cert = await Certificate.findByIdAndUpdate(
      params.id,
      { googleDriveUrl, updatedAt: new Date() },
      { new: true },
    );

    if (!cert) {
      return NextResponse.json(
        { statusCode: 404, message: "Certificate not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      statusCode: 200,
      message: "Document link updated. QR code URL remains unchanged.",
      data: { certificate: cert },
    });
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE /api/certificates/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();

    const cert = await Certificate.findByIdAndDelete(params.id);

    if (!cert) {
      return NextResponse.json(
        { statusCode: 404, message: "Certificate not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      statusCode: 200,
      message: "Certificate deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: error.message },
      { status: 500 },
    );
  }
}
