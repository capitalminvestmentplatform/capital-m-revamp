import { serialize } from "cookie";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";

export async function POST() {
  try {
    // Clear the token by setting an expired cookie
    const cookie = serialize("token", "", {
      path: "/",
      maxAge: 0, // Expire the cookie immediately
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    // Return response with cleared cookie
    const response = sendSuccessResponse(200, "Logout successful");

    response.headers.set("Set-Cookie", cookie);
    return response;
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
