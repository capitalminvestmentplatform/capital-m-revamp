import { redirect, notFound } from "next/navigation";
import Certificate from "@/models/Certificate";
import { connectToDatabase } from "@/lib/db";

interface PageProps {
  params: Promise<{ qrToken: string }>;
}

export default async function DocsPage({ params }: PageProps) {
  const { qrToken } = await params;

  await connectToDatabase();

  const cert = (await Certificate.findOne({ qrToken })
    .select("googleDriveUrl")
    .lean()) as { googleDriveUrl: string } | null;

  if (!cert) notFound();

  redirect(cert.googleDriveUrl);
}
