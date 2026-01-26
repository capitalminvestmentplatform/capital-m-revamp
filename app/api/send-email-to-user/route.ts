import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { welcomeEmailTemp } from "@/templates/emails";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn } from "@/utils/server";
import { NextRequest } from "next/server";

function toE164(phone?: string) {
  if (!phone) return "";
  const p = phone.trim().replace(/\s+/g, "");
  if (!p) return "";
  return p.startsWith("+") ? p : `+${p}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id, firstName, lastName, email, phone } = await req.json();

    const decoded: any = await loggedIn();
    if (!decoded || decoded.role !== "Admin") {
      return sendErrorResponse(403, "Unauthorized access");
    }

    const user = await User.findById(id).lean();
    if (!user) return sendErrorResponse(404, "User not found");

    const { password } = user as any;
    const whatsapp = toE164(phone);

    // 1) Brevo Contact + WhatsApp (non-blocking)
    let whatsappStatus: "sent" | "skipped" | "failed" = "skipped";
    let whatsappError: any = null;

    if (whatsapp) {
      try {
        // A) Upsert contact (so FIRSTNAME attribute is available)
        const cRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}api/brevo/contact`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              email,
              firstName,
              lastName,
              whatsapp,
            }),
          }
        );

        if (!cRes.ok) {
          const err = await cRes.text();
          throw new Error(`Contact API failed: ${err}`);
        }

        // B) Send WhatsApp welcome template
        const wRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}api/brevo/whatsapp`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              whatsapp,
              // templateId optional; route will default to BREVO_WELCOME_TEMPLATE_ID
            }),
          }
        );

        if (!wRes.ok) {
          const err = await wRes.text();
          throw new Error(`WhatsApp API failed: ${err}`);
        }

        whatsappStatus = "sent";
      } catch (err: any) {
        whatsappStatus = "failed";
        whatsappError = err?.message || err;
        console.error("WhatsApp flow error:", err);
      }
    }

    // 2) Send Welcome Email (still send even if WhatsApp fails)
    await welcomeEmailTemp(
      { firstName, lastName, email, password },
      "Welcome to Capital M Investment Platform"
    );

    return sendSuccessResponse(200, "Welcome sent successfully", {
      emailStatus: "sent",
      whatsappStatus,
      whatsappError,
    });
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
