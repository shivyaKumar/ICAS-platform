import { cookies } from "next/headers";

const BASE = process.env.API_BASE_URL ?? "http://127.0.0.1:5275";

export async function GET() {
  try {
    const token = (await cookies()).get("icas_auth")?.value;
    const response = await fetch(`${BASE}/api/frameworks`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    });

    const text = await response.text();
    return new Response(text, { status: response.status });
  } catch (error) {
    console.error("[Proxy] GET /api/frameworks failed", error);
    return new Response("Failed to fetch frameworks", { status: 500 });
  }
}
