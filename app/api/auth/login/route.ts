import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { setCookies } from "@/utils/server";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { NextRequest } from "next/server";

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    // Ensure password is exactly 4 digits
    if (!/^\d{4}$/.test(password)) {
      return sendErrorResponse(400, "Password must be a 4-digit PIN");
    }

    let user;

    // If the provided "email" is not a valid email, treat it as a clientCode
    if (email && isValidEmail(email)) {
      user = await User.findOne({ email: email.toLowerCase() }).select(
        "-verificationToken"
      );
    } else {
      user = await User.findOne({ clientCode: email.toUpperCase() }).select(
        "-verificationToken"
      );
    }

    if (!user) {
      return sendErrorResponse(404, "User not found");
    }

    // Compare the entered PIN with the stored PIN
    if (user.password !== password) {
      return sendErrorResponse(401, "Invalid credentials");
    }

    // Remove `password` and `verificationToken` from the response
    const { password: _, verificationToken: __, ...userData } = user.toObject();

    // Create response and attach the cookie
    const response = sendSuccessResponse(200, "Login successful", userData);

    let cookie = await setCookies(user, "token");
    response.headers.set("Set-Cookie", cookie);
    return response;
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
