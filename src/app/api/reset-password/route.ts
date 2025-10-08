const BASE = process.env.API_BASE_URL ?? "http://127.0.0.1:5275"; // Use env variable first

export async function POST(req: Request) {
  try {
    const body = await req.text();

    // Correct endpoint: AccountController -> reset-password
    const r = await fetch(`${BASE}/api/account/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store", // Prevents caching on POST requests
    });

    // Forward the backend’s actual message
    const text = await r.text();
    return new Response(text, { status: r.status });
  } catch (err) {
    console.error("Reset password error:", err);
    return new Response("Failed to reset password", { status: 500 });
  }
}
