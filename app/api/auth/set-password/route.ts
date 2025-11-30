import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { loggedIn } from "@/utils/server";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const decoded: any = await loggedIn();

    const { password, confirmPassword } = await req.json();

    if (!password || !confirmPassword) {
      return sendErrorResponse(400, "Passwords are required");
    }

    if (password !== confirmPassword) {
      return sendErrorResponse(400, "Passwords do not match");
    }

    // Ensure password is a 4-digit PIN
    if (!/^\d{4}$/.test(password)) {
      return sendErrorResponse(400, "Password must be a 4-digit PIN");
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return sendErrorResponse(404, "User not found");
    }

    // Set new PIN without hashing
    user.password = password;
    user.firstLogin = false;
    await user.save();

    return sendSuccessResponse(200, "PIN set successfully");
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
