import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { loggedIn } from "@/utils/server";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    const decoded: any = await loggedIn();
    const { userId, password, confirmPassword } = await req.json();

    // Determine which user to update (self or target user by admin)
    const targetUserId =
      decoded.role === "Admin" && userId ? userId : decoded.id;

    // Find user by ID
    const user = await User.findById(targetUserId);
    if (!user) {
      return sendErrorResponse(404, "User not found");
    }

    // Validate PIN format (exactly 4 digits)
    if (!/^\d{4}$/.test(password)) {
      return sendErrorResponse(400, "Password must be a 4-digit PIN");
    }

    // Ensure password and confirmPassword match
    if (password !== confirmPassword) {
      return sendErrorResponse(400, "Passwords do not match");
    }

    // Update user fields if provided
    user.password = password;

    // Save the updated user details
    await user.save();

    return sendSuccessResponse(200, "Pin updated successfully", user);
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
