import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE = process.env.API_BASE_URL || "http://127.0.0.1:5275";

/* ---------- GET: Fetch single assessment ---------- */
export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await context.params; 
    const token = (await cookies()).get("icas_auth")?.value;
    const endpoint = `${BASE}/api/assessments/${id}`;

    console.log("Fetching single assessment:", endpoint);

    const res = await fetch(endpoint, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();

    if (!res.ok) {
      console.error(`Backend responded ${res.status}:`, text);
      return NextResponse.json({ success: false, message: text }, { status: res.status });
    }

    console.log("Single assessment fetched.");
    return new Response(text, { status: res.status });
  } catch (err) {
    console.error("GET Single Assessment error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}

/* ---------- PUT: Update assessment ---------- */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await context.params; 
    const token = (await cookies()).get("icas_auth")?.value;
    const body = await req.json();
    const endpoint = `${BASE}/api/assessments/${id}`;

    const res = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error(`Backend update failed ${res.status}:`, text);
      return NextResponse.json({ success: false, message: text }, { status: res.status });
    }

    console.log("Assessment updated successfully.");
    return new Response(text, { status: res.status });
  } catch (err) {
    console.error("PUT Assessment error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update assessment" },
      { status: 500 }
    );
  }
}
