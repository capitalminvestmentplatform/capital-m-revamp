import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";
import crypto from "crypto";
import { forgotPasswordEmail } from "@/templates/emails";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email } = await req.json();

    if (!email) {
      return sendErrorResponse(400, "Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendErrorResponse(404, "User not found");
    }

    // Generate a token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set reset token in DB (valid for 15 minutes)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min expiration
    await user.save();

    const { firstName, lastName } = user;
    await forgotPasswordEmail(
      { firstName, lastName, email, resetToken },
      "Reset Pin Email - Capital M Investment Platform"
    );

    return sendSuccessResponse(
      200,
      "Password reset link sent to email",
      resetToken
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
