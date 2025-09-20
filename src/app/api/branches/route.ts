import { cookies } from "next/headers";

const BASE = "http://127.0.0.1:5275";

// Get all branches
export async function GET() {
  try {
    const token = (await cookies()).get("icas_auth")?.value;
    const r = await fetch(`${BASE}/api/branches`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return new Response(await r.text(), { status: r.status });
  } catch (err) {
    console.error("GET Branches error:", err);
    return new Response("Failed to fetch branches", { status: 500 });
  }
}

// Create new branch
export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("icas_auth")?.value;
    const body = await req.text();
    const r = await fetch(`${BASE}/api/branches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
    });
    return new Response(await r.text(), { status: r.status });
  } catch (err) {
    console.error("POST Branch error:", err);
    return new Response("Failed to create branch", { status: 500 });
  }
}
