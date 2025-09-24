// src/app/api/logout/route.ts
import { cookies } from "next/headers";

export async function POST() {
  // Clear the cookie by setting it to empty + expired
  const cookieStore = await cookies();
  cookieStore.set("icas_auth", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0), // expired
    path: "/",
  });

  // If you also want to call backend logout (optional):
  /*
  await fetch("http://127.0.0.1:5275/api/auth/logout", {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
  */

  return Response.json({ success: true });
}
