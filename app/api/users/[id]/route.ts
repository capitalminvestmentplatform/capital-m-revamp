import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { loggedIn } from "@/utils/server";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return sendErrorResponse(400, "Invalid user ID");
    }

    const user = await User.findById(id, "-password");
    if (!user) {
      return sendErrorResponse(404, "User not found");
    }

    return sendSuccessResponse(200, "User fetched successfully", user);
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return sendErrorResponse(400, "Invalid user ID");
    }

    const decoded: any = await loggedIn();

    // Check if the user is an admin
    if (decoded.role !== "Admin") {
      return sendErrorResponse(403, "Access denied");
    }

    // Find and delete user
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return sendErrorResponse(404, "User not found");
    }

    return sendSuccessResponse(200, "User deleted successfully");
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
