import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE = process.env.API_BASE_URL || "http://127.0.0.1:5275";

export async function GET() {
  try {
    const token = (await cookies()).get("icas_auth")?.value ?? "";

    const res = await fetch(`${BASE}/api/assessments/my-task`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Backend error:", text);
      return NextResponse.json({ message: text }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching staff assessments:", err);
    return NextResponse.json({ message: "Failed to load assessments" }, { status: 500 });
  }
}
