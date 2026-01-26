import { NextRequest } from "next/server";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";

function toE164(phone: string) {
  const p = (phone || "").trim().replace(/\s+/g, "");
  if (!p) return "";
  return p.startsWith("+") ? p : `+${p}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const email = (body.email || "").trim();
    const firstName = (body.firstName || "").trim();
    const lastName = (body.lastName || "").trim();
    const whatsapp = (body.whatsapp || "").trim(); // you can pass whatsapp here

    if (!email) return sendErrorResponse(400, "email is required");
    if (!whatsapp) return sendErrorResponse(400, "whatsapp is required");

    const phone = toE164(whatsapp);
    if (!phone.startsWith("+") || phone.length < 8) {
      return sendErrorResponse(
        400,
        "whatsapp must be a valid E.164 number e.g. +923001234567"
      );
    }

    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        email,
        phone, // IMPORTANT: top-level phone (required for WhatsApp attribute templates)
        attributes: {
          FIRSTNAME: firstName || "User",
          LASTNAME: lastName || "",
          WHATSAPP: phone, // custom attribute for WhatsApp number
        },
        updateEnabled: true,
      }),
    });

    const dataText = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(dataText);
    } catch {
      data = dataText;
    }

    if (!res.ok) {
      return sendErrorResponse(400, "Brevo contact upsert failed", data);
    }

    return sendSuccessResponse(
      200,
      "Brevo contact upserted successfully",
      data
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
