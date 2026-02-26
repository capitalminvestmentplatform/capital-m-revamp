import { NextRequest, NextResponse } from "next/server";
import Certificate from "@/models/Certificate";
import { connectToDatabase } from "@/lib/db";

// GET /api/certificates/token/[qrToken]
// Called by the client-side docs/[qrToken] page to resolve certificate data

export async function GET(
  _request: NextRequest,
  { params }: { params: { qrToken: string } },
) {
  try {
    await connectToDatabase();

    const cert = await Certificate.findOne({ qrToken: params.qrToken })
      .select("userName email googleDriveUrl createdAt")
      .lean();

    if (!cert) {
      return NextResponse.json(
        { statusCode: 404, message: "Certificate not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      statusCode: 200,
      message: "Certificate fetched successfully",
      data: { certificate: cert },
    });
  } catch (error: any) {
    console.error("[GET /api/certificates/token/[qrToken]]", error);
    return NextResponse.json(
      { statusCode: 500, message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
