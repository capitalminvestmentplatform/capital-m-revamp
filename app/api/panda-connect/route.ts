import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { id } = await req.json();
    const response = await fetch(`${process.env.PANDA_API_URI}HoldingsMv2`, {
      method: "POST",
      headers: {
        Token: process.env.PANDA_TOKEN as string,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uuid: process.env.PANDA_UUID,
        id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch portfolios");
    }

    return sendSuccessResponse(200, "data fetched successfully", data.data);
  } catch (error: any) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
