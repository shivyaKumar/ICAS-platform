import { cookies } from "next/headers";

const BASE = "http://127.0.0.1:5275";

// Get user by ID
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const token = (await cookies()).get("icas_auth")?.value;
    const { id } = await context.params; 

    const r = await fetch(`${BASE}/api/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return new Response(await r.text(), { status: r.status });
  } catch (err) {
    console.error("GET User error:", err);
    return new Response("Failed to fetch user", { status: 500 });
  }
}

// Update user by ID
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const token = (await cookies()).get("icas_auth")?.value;
    const { id } = await context.params; 
    const body = await req.json(); 

    const r = await fetch(`${BASE}/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body), 
    });

    return new Response(await r.text(), { status: r.status });
  } catch (err) {
    console.error("PUT User error:", err);
    return new Response("Failed to update user", { status: 500 });
  }
}

// Delete user by ID
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const token = (await cookies()).get("icas_auth")?.value;
    const { id } = await context.params; 

    const r = await fetch(`${BASE}/api/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (r.status === 204) {
      // handle no-content response properly
      return new Response(null, { status: 204 });
    }

    return new Response(await r.text(), { status: r.status });
  } catch (err) {
    console.error("DELETE User error:", err);
    return new Response("Failed to delete user", { status: 500 });
  }
}
