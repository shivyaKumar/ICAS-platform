// src/app/api/me/route.ts
import { cookies } from "next/headers";

const BASE = "http://127.0.0.1:5275";

export async function GET() {
  // Await cookies() because it's async in your setup
  const cookieStore = await cookies();
  const token = cookieStore.get(process.env.JWT_COOKIE ?? "icas_auth")?.value;

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Forward token as Bearer to backend
  const r = await fetch(`${BASE}/api/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!r.ok) {
    return new Response("Unauthorized", { status: r.status });
  }

  const data = await r.json();
  return Response.json(data);
}
