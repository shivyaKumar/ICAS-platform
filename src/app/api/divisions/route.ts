import { cookies } from "next/headers";

const BASE = "http://127.0.0.1:5275";

// Get all divisions
export async function GET() {
  try {
    const token = (await cookies()).get("icas_auth")?.value;
    const r = await fetch(`${BASE}/api/divisions`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return new Response(await r.text(), { status: r.status });
  } catch (err) {
    console.error("GET Divisions error:", err);
    return new Response("Failed to fetch divisions", { status: 500 });
  }
}

// Create new division
export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("icas_auth")?.value;
    const raw = await req.json();

    const body = {
      name: raw.name,
      description: raw.description || null,
    };

    const r = await fetch(`${BASE}/api/divisions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    return new Response(await r.text(), { status: r.status });
  } catch (err) {
    console.error("POST Division error:", err);
    return new Response("Failed to create division", { status: 500 });
  }
}
