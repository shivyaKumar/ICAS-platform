// src/app/api/login/route.ts
export const runtime = "nodejs";

import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // tolerant parsing (handles both JSON and form)
    const ct = req.headers.get("content-type") || "";
    let email = "", password = "";

    if (ct.includes("application/json")) {
      const raw = await req.text();
      const p = JSON.parse(raw);
      email = p.email || "";
      password = p.password || "";
    } else if (ct.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      email = String(form.get("email") || "");
      password = String(form.get("password") || "");
    } else {
      const raw = await req.text();
      const p = JSON.parse(raw);
      email = p.email || "";
      password = p.password || "";
    }

    if (!email || !password) {
      return Response.json({ success: false, message: "email and password required" }, { status: 400 });
    }

    const base = "http://127.0.0.1:5275"; // your API works here

    const r = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (!r.ok) {
      const msg = await r.text();
      return Response.json({ success: false, message: msg || `API ${r.status}` }, { status: r.status });
    }

    const data = await r.json(); // { token, role? }
    if (!data?.token) {
      return Response.json({ success: false, message: "No token returned from API" }, { status: 500 });
    }

    const hours = Number(process.env.JWT_EXPIRES_HOURS ?? 3);
    const expires = new Date(Date.now() + hours * 3600 * 1000);

    cookies().set({
      name: process.env.JWT_COOKIE ?? "icas_auth",
      value: data.token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires,
      path: "/",
    });

    return Response.json({ success: true, role: data.role ?? "User" });
  } catch (e: any) {
    return Response.json({ success: false, message: String(e?.message || e) }, { status: 500 });
  }
}
