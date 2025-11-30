import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { IncomingForm } from "formidable";
import type { NextApiRequest } from "next";
import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";
import { ProjectedReturn } from "@/lib/utils";

export async function sendNotification(
  to: string,
  payload: { title: string; message: string; type: string }
) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, ...payload }),
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}

export async function loggedIn() {
  // Get token from cookies
  const cookiesData = await cookies();
  const token = cookiesData.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the token
  const jwtSecret1 = process.env.JWT_SECRET as string;
  let decoded;
  try {
    decoded = jwt.verify(token, jwtSecret1) as {
      id: string;
      role: string;
      email: string;
    };

    if (!decoded?.email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return decoded;
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function setCookies(
  user: {
    _id: string;
    email: string;
    role: string;
    portfolioId: string;
    firstName: string;
    lastName: string;
  },
  cookieName: string
) {
  const jwtSecret = process.env.JWT_SECRET as string;
  // Generate JWT token
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      portfolioId: user.portfolioId,
      name: `${user.firstName} ${user.lastName}`,
    },
    jwtSecret,
    {
      expiresIn: "1d",
    }
  );

  // Set token in HTTP-only cookie
  const cookie = serialize(cookieName, token, {
    sameSite: "strict", // Prevents CSRF attacks
    path: "/", // Accessible on all routes
    maxAge: 1 * 24 * 60 * 60, // 1-day expiration
    secure: true,
  });

  return cookie;
}

// This function converts a Web Fetch API Request to a readable stream for formidable
export async function parseForm(
  request: Request
): Promise<{ fields: any; files: any }> {
  const contentType = request.headers.get("content-type");
  const contentLength = request.headers.get("content-length");

  if (!contentType || !contentType.includes("multipart/form-data")) {
    throw new Error("Invalid content-type");
  }

  // Convert Web Request body to Buffer
  const arrayBuffer = await request.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Build a mock req object with stream and headers
  const reqStream = Readable.from(buffer) as any;
  reqStream.headers = {
    "content-type": contentType,
    "content-length": contentLength || buffer.length,
  };

  const form = new IncomingForm({ multiples: true, keepExtensions: true });

  return new Promise((resolve, reject) => {
    form.parse(reqStream, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export async function processTiptapImages(
  html: string,
  folder: string
): Promise<string> {
  const imgTagRegex = /<img[^>]+src="([^">]+)"/g;
  let match: RegExpExecArray | null;
  const uploads: { original: string; uploaded: string }[] = [];

  // Find all base64 images
  while ((match = imgTagRegex.exec(html)) !== null) {
    const src = match[1];
    if (src.startsWith("data:image")) {
      try {
        const folderName = process.env.CLOUDINARY_FOLDER_NAME + folder;

        const result = await cloudinary.uploader.upload(src, {
          folderName,
        });
        uploads.push({ original: src, uploaded: result.secure_url });
      } catch (err) {
        console.error("Cloudinary upload error:", err);
      }
    } else if (src.includes("res.cloudinary.com")) {
      continue;
    }
  }

  // Replace all base64 src with Cloudinary URLs
  let updatedHtml = html;
  for (const { original, uploaded } of uploads) {
    updatedHtml = updatedHtml.replace(original, uploaded);
  }

  return updatedHtml;
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

/**
 * Validates user input and returns a normalized projectedReturn object
 * that matches the schema used in Product.projectedReturn.
 * Throws an Error with a user-friendly message on invalid input.
 */
export function validateAndNormalizeProjectedReturn(
  pr: unknown
): ProjectedReturn {
  if (!pr || typeof pr !== "object") {
    throw new Error("projectedReturn must be an object.");
  }
  const { type, mode, fixedValue, minValue, maxValue, currency } =
    pr as ProjectedReturn;

  if (type !== "percentage" && type !== "amount") {
    throw new Error('projectedReturn.type must be "percentage" or "amount".');
  }

  if (mode !== "fixed" && mode !== "range") {
    throw new Error('projectedReturn.mode must be "fixed" or "range".');
  }

  if (mode === "fixed") {
    if (!isFiniteNumber(fixedValue)) {
      throw new Error(
        "projectedReturn.fixedValue is required and must be a number for fixed mode."
      );
    }
  }

  if (mode === "range") {
    if (!isFiniteNumber(minValue) || !isFiniteNumber(maxValue)) {
      throw new Error(
        "projectedReturn.minValue and projectedReturn.maxValue are required and must be numbers for range mode."
      );
    }
    if (minValue > maxValue) {
      throw new Error(
        "projectedReturn.minValue cannot be greater than projectedReturn.maxValue."
      );
    }
  }

  // Normalize currency only for amount type; ignore/strip for percentage.
  const normalizedCurrency =
    type === "amount"
      ? (currency && String(currency).trim()) || "AED"
      : undefined;

  const normalized: ProjectedReturn = {
    type,
    mode,
    currency: normalizedCurrency ?? null,
  };

  if (mode === "fixed") {
    normalized.fixedValue = fixedValue!;
  } else {
    normalized.minValue = minValue!;
    normalized.maxValue = maxValue!;
  }

  return normalized;
}
