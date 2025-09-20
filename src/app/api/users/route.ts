import { cookies } from "next/headers";

const BASE = "http://127.0.0.1:5275";

// Get all users
export async function GET() {
  try {
    const token = (await cookies()).get("icas_auth")?.value;
    const r = await fetch(`${BASE}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return new Response(await r.text(), { status: r.status });
  } catch (err) {
    console.error("GET Users error:", err);
    return new Response("Failed to fetch users", { status: 500 });
  }
}

// Create new user
export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("icas_auth")?.value;
    const body = await req.text();
    const r = await fetch(`${BASE}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
    });
    return new Response(await r.text(), { status: r.status });
  } catch (err) {
    console.error("POST User error:", err);
    return new Response("Failed to create user", { status: 500 });
  }
}
