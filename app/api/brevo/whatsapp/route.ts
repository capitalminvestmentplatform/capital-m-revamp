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

    const whatsapp = (body.whatsapp || "").trim();
    if (!whatsapp) return sendErrorResponse(400, "whatsapp is required");

    const phone = toE164(whatsapp);
    if (!phone.startsWith("+") || phone.length < 8) {
      return sendErrorResponse(
        400,
        "whatsapp must be a valid E.164 number e.g. +923001234567"
      );
    }

    // allow override templateId, else use welcome template
    const templateId = Number(
      body.templateId ?? process.env.BREVO_WELCOME_TEMPLATE_ID
    );
    if (!templateId)
      return sendErrorResponse(400, "templateId is missing/invalid");

    const senderNumber = process.env.BREVO_WHATSAPP_SENDER;
    if (!senderNumber)
      return sendErrorResponse(500, "BREVO_WHATSAPP_SENDER is missing");

    const res = await fetch("https://api.brevo.com/v3/whatsapp/sendMessage", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        senderNumber,
        templateId,
        contactNumbers: [phone], // IMPORTANT
        // No parameters because FIRSTNAME is read from contact attributes
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
      return sendErrorResponse(400, "Brevo WhatsApp send failed", data);
    }

    return sendSuccessResponse(200, "WhatsApp message sent successfully", data);
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
