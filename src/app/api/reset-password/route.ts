const BASE = "http://127.0.0.1:5275"; // Backend API base

export async function POST(req: Request) {
  try {
    const body = await req.text();

    // Fixed path: AccountController not AuthController
    const r = await fetch(`${BASE}/api/account/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    const text = await r.text();
    return new Response(text, { status: r.status });
  } catch (err) {
    console.error("Reset password error:", err);
    return new Response("Failed to reset password", { status: 500 });
  }
}
