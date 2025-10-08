// src/app/api/login/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // ----------------------------------------
    // Parse body (supports JSON or form-data)
    // ----------------------------------------
    const contentType = req.headers.get("content-type") || "";
    let email = "";
    let password = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      email = body.email || "";
      password = body.password || "";
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      email = String(form.get("email") || "");
      password = String(form.get("password") || "");
    } else {
      const raw = await req.text();
      try {
        const parsed = JSON.parse(raw);
        email = parsed.email || "";
        password = parsed.password || "";
      } catch {
        // ignore invalid JSON
      }
    }

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password required" },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // Send login request to backend API
    // ----------------------------------------
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5275";
    const response = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (!response.ok) {
      const msg = await response.text();
      return NextResponse.json(
        { success: false, message: msg || `API ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json(); // expected: { token, role? }
    if (!data?.token) {
      return NextResponse.json(
        { success: false, message: "No token returned from backend" },
        { status: 500 }
      );
    }

    // ----------------------------------------
    // Set secure cookie (via NextResponse)
    // ----------------------------------------
    const hours = Number(process.env.JWT_EXPIRES_HOURS ?? 3);
    const expires = new Date(Date.now() + hours * 3600 * 1000);

    const res = NextResponse.json({
      success: true,
      role: data.role ?? "User",
    });

    res.cookies.set({
      name: process.env.JWT_COOKIE ?? "icas_auth",
      value: data.token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires,
      path: "/",
    });

    console.log("[LOGIN SUCCESS]", { email, role: data.role ?? "User" });
    return res;
  } catch (e: unknown) {
    console.error("[LOGIN ERROR]", e);
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
