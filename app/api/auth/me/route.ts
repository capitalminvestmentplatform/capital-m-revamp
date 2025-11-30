// app/api/auth/me/route.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return Response.json({ user: null });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return Response.json({ user: decoded });
  } catch {
    return Response.json({ user: null });
  }
}
