import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { token } = await req.json();

    if (!token) {
      return sendErrorResponse(400, "Token is required");
    }

    // Verify token
    let decoded;
    try {
      const jwtSecret = process.env.JWT_SECRET as string;
      decoded = jwt.verify(token, jwtSecret) as { email: string };
    } catch (err) {
      return sendErrorResponse(401, "Invalid or expired reset token");
    }

    // Find user by email
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return sendErrorResponse(404, "User not found");
    }

    // Check if already verified
    if (user.isVerified) {
      return sendSuccessResponse(200, "User already verified");
    }

    // Update user status
    user.isVerified = true;
    user.verificationToken = null; // Remove the token after verification
    await user.save();

    return sendSuccessResponse(200, "Email verified successfully");
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
