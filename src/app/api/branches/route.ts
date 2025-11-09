import { cookies } from "next/headers";

const BASE = process.env.API_BASE_URL ?? "http://127.0.0.1:5275";

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
    const raw = await req.json();

    const divisionId = raw.divisionId ? Number(raw.divisionId) : NaN;

    if (!raw.name || isNaN(divisionId)) {
      return new Response(
        JSON.stringify({
          message: "Branch name and valid divisionId are required",
        }),
        { status: 400 }
      );
    }

    const body = {
      name: raw.name,
      location: raw.location || null,
      divisionId,
    };

    const r = await fetch(`${BASE}/api/branches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const text = await r.text();
    console.log("Create branch response:", r.status, text);

    return new Response(text, { status: r.status });
  } catch (err) {
    console.error("POST Branch error:", err);
    return new Response("Failed to create branch", { status: 500 });
  }
}
