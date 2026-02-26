import { NextRequest, NextResponse } from "next/server";
import Certificate from "@/models/Certificate";
import User from "@/models/User"; // adjust path if needed
import QRCode from "qrcode";
import { randomUUID } from "crypto";
import { connectToDatabase } from "@/lib/db";

// ─── POST /api/certificates ───────────────────────────────────────────────────
//
// Payload from Certificates.tsx:
// {
//   userId: string | null,
//   guestName: string | null,
//   guestEmail: string | null,
//   googleDriveUrl: string,
// }
//
// In both cases (userId or guest), resolves to a flat:
//   userName = firstName + lastName  (or guestName)
//   email    = user.email            (or guestEmail)
// ...and saves those directly on the Certificate document.

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { userId, guestName, guestEmail, googleDriveUrl } = body;

    // ── Validate Drive URL ──────────────────────────────────────────
    if (!googleDriveUrl?.trim()) {
      return NextResponse.json(
        { statusCode: 400, message: "Google Drive URL is required" },
        { status: 400 },
      );
    }

    const isValidDriveUrl =
      googleDriveUrl.startsWith("https://drive.google.com") ||
      googleDriveUrl.startsWith("https://docs.google.com");

    if (!isValidDriveUrl) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "Must be a valid Google Drive or Google Docs URL",
        },
        { status: 400 },
      );
    }

    // ── Resolve userName + email ────────────────────────────────────
    let userName: string;
    let email: string;
    const isGuest = !userId;

    if (isGuest) {
      // Guest path — use manually entered name & email
      if (!guestName?.trim() || !guestEmail?.trim()) {
        return NextResponse.json(
          {
            statusCode: 400,
            message:
              "guestName and guestEmail are required when userId is not provided",
          },
          { status: 400 },
        );
      }
      userName = guestName.trim();
      email = guestEmail.trim().toLowerCase();
    } else {
      // Platform user path — fetch firstName, lastName, email from User model
      const user = (await User.findById(userId)
        .select("firstName lastName email")
        .lean()) as {
        firstName: string;
        lastName: string;
        email: string;
      } | null;

      if (!user) {
        return NextResponse.json(
          { statusCode: 404, message: "User not found" },
          { status: 404 },
        );
      }

      userName = `${user.firstName} ${user.lastName}`.trim();
      email = user.email.toLowerCase();
    }

    // ── Generate stable QR token + code ────────────────────────────
    const qrToken = randomUUID();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const qrUrl = `${baseUrl}docs/${qrToken}`;

    const qrCode = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 400,
      color: { dark: "#0A0A0A", light: "#FFFFFF" },
    });

    // ── Save certificate ────────────────────────────────────────────
    const certificate = await Certificate.create({
      userId: isGuest ? null : userId,
      userName,
      email,
      googleDriveUrl: googleDriveUrl.trim(),
      qrToken,
      qrCode,
    });

    return NextResponse.json(
      {
        statusCode: 201,
        message: "Certificate QR generated successfully",
        data: {
          certificate: {
            _id: certificate._id,
            userId: certificate.userId,
            userName: certificate.userName,
            email: certificate.email,
            googleDriveUrl: certificate.googleDriveUrl,
            qrUrl,
            qrCode: certificate.qrCode,
            createdAt: certificate.createdAt,
            updatedAt: certificate.updatedAt,
          },
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[POST /api/certificates]", error);
    return NextResponse.json(
      { statusCode: 500, message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── GET /api/certificates ────────────────────────────────────────────────────
//
// Returns all certificates newest first.
// userName + email are already stored flat — no populate needed.

export async function GET() {
  try {
    await connectToDatabase();

    const certificates = await Certificate.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      statusCode: 200,
      message: "Certificates fetched successfully",
      data: { certificates },
    });
  } catch (error: any) {
    console.error("[GET /api/certificates]", error);
    return NextResponse.json(
      { statusCode: 500, message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
