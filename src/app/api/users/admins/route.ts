import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL ?? "http://127.0.0.1:5275";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("icas_auth")?.value;
    const url = new URL(req.url);

    const target = new URL(`${API_BASE}/api/users/admins`);
    url.searchParams.forEach((value, key) => {
      if (value) target.searchParams.set(key, value);
    });

    const response = await fetch(target.toString(), {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    });

    const text = await response.text();
    if (!response.ok) {
      return NextResponse.json({ message: text || "Failed to load admins" }, { status: response.status });
    }

    return new Response(text, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Users/Admins] proxy failed", error);
    return NextResponse.json({ message: "Unable to load admins" }, { status: 500 });
  }
}
