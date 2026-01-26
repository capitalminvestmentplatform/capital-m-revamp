import { NextRequest } from "next/server";

interface EmailRequest {
  to: string;
  subject: string;
  content: string;
  pdf?: string;
  pdfName?: string;
}

interface EmailResponse {
  messageId: string;
  message: string;
}

async function fetchPdfAsBase64(pdfUrl: string): Promise<string> {
  const res = await fetch(pdfUrl);

  if (!res.ok) {
    throw new Error("Failed to fetch PDF from Cloudinary");
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return buffer.toString("base64");
}

export async function POST(req: NextRequest): Promise<Response> {
  const { to, subject, content, pdf, pdfName }: EmailRequest = await req.json();

  try {
    let base64 = "";
    let payload = "";
    if (pdf) {
      base64 = await fetchPdfAsBase64(pdf);
      payload = JSON.stringify({
        sender: {
          email: "no-reply@capitalm.ae",
          name: "Capital M Investment Platform",
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: content,
        attachment: pdf
          ? [
              {
                name: pdfName,
                content: base64,
              },
            ]
          : null,
      });
    } else {
      payload = JSON.stringify({
        sender: {
          email: "no-reply@capitalm.ae",
          name: "Capital M Investment Platform",
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: content,
      });
    }
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY as string,
        "Content-Type": "application/json",
      },
      body: payload,
    });

    const data: EmailResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: "Failed to send email", details: error.message }),
      { status: 500 }
    );
  }
}
