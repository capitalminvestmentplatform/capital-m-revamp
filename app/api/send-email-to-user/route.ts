import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { welcomeEmailTemp } from "@/templates/emails";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn, sendNotification } from "@/utils/server";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const decoded: any = await loggedIn();
    if (!decoded || decoded.role !== "Admin") {
      return sendErrorResponse(403, "Unauthorized access");
    }

    const user = await User.findById(id);
    if (!user) {
      return sendErrorResponse(404, "User not found");
    }

    const { firstName, lastName, email, password } = user;

    await welcomeEmailTemp(
      { firstName, lastName, email, password },
      "Welcome to Capital M Investment Platform"
    );

    return sendSuccessResponse(200, "Email sent to client successfully");
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
