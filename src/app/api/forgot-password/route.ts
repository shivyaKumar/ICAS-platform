import { NextResponse } from "next/server";

const BASE = process.env.API_BASE_URL ?? "http://127.0.0.1:5275";

export async function POST(req: Request) {
  try {
    const body = await req.text();

    // Calls your backend AccountController -> forgot-password
    const res = await fetch(`${BASE}/api/account/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const text = await res.text();
    return new NextResponse(text, { status: res.status });
  } catch (err) {
    console.error("Forgot password error:", err);
    return new NextResponse("Failed to send reset email", { status: 500 });
  }
}
