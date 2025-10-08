// src/app/api/me/route.ts
import { cookies } from "next/headers";

const BASE = process.env.API_BASE_URL ?? "http://127.0.0.1:5275";

export async function GET() {
  try {
    // Await cookies() because it's async in your setup
    const cookieStore = await cookies();
    const token = cookieStore.get(process.env.JWT_COOKIE ?? "icas_auth")?.value;

    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Forward token as Bearer to backend
    const res = await fetch(`${BASE}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return new Response(await res.text(), { status: res.status });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error("GET /api/me error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}
