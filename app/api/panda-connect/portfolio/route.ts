import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { id } = await req.json();
    const response = await fetch(`${process.env.PANDA_API_URI}Portfolios`, {
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

    return sendSuccessResponse(
      200,
      "portfolios fetched successfully",
      data.portfolios
    );
  } catch (error: any) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
