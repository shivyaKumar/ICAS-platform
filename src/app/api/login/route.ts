// src/app/api/login/route.ts
import { NextResponse } from "next/server";
import { verifyLogin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const result = await verifyLogin(email, password);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 401 });
    }
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
