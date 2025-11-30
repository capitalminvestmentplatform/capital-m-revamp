import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";
import crypto from "crypto";
import { cookies } from "next/headers";
import { setCookies } from "@/utils/server";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { token } = await req.json();

    if (!token) {
      return sendErrorResponse(400, "Token is required");
    }

    // Hash the received token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with the given hashed token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure token is not expired
    });

    if (!user) {
      return sendErrorResponse(401, "Invalid or expired reset token");
    }

    const response = sendSuccessResponse(
      200,
      "Token is valid. Proceed with password reset."
    );

    let cookie = await setCookies(user, "token");
    response.headers.set("Set-Cookie", cookie);

    return response;
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
