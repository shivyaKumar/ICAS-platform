import { cookies } from "next/headers";

const BASE = process.env.API_BASE_URL ?? "http://127.0.0.1:5275";

export async function GET() {
  try {
    // Correct cookie name from backend
    const token = (await cookies()).get("icas_auth")?.value;

    const res = await fetch(`${BASE}/api/roles`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      // forward the real error instead of hiding it
      return new Response(await res.text(), { status: res.status });
    }

    return new Response(await res.text(), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error occurred";
    return new Response("Error fetching roles: " + message, { status: 500 });
  }
}
