import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { loggedIn } from "@/utils/server";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const decoded: any = await loggedIn();
    // Find user by ID
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return sendErrorResponse(404, "User not found");
    }

    return sendSuccessResponse(200, "User fetched successfully", user);
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    const decoded: any = await loggedIn();
    const { userId, firstName, lastName, phone } = await req.json();

    // Determine which user to update (self or target user by admin)
    const targetUserId =
      decoded.role === "Admin" && userId ? userId : decoded.id;

    // Find user by ID
    const user = await User.findById(targetUserId);
    if (!user) {
      return sendErrorResponse(404, "User not found");
    }

    // Update user fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;

    // Save the updated user details
    await user.save();

    return sendSuccessResponse(200, "profile updated successfully", user);
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
