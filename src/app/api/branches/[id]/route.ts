import { cookies } from "next/headers";

const BASE = "http://127.0.0.1:5275";

// Get branch by ID
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const token = (await cookies()).get("icas_auth")?.value;
    const r = await fetch(`${BASE}/api/branches/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return new Response(await r.text(), { status: r.status });
  } catch (err) {
    console.error("GET Branch error:", err);
    return new Response("Failed to fetch branch", { status: 500 });
  }
}

// Update branch by ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = (await cookies()).get("icas_auth")?.value;
    const body = await req.text();
    const r = await fetch(`${BASE}/api/branches/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
    });
    return new Response(await r.text(), { status: r.status });
  } catch (err) {
    console.error("PUT Branch error:", err);
    return new Response("Failed to update branch", { status: 500 });
  }
}

// Delete branch by ID
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const token = (await cookies()).get("icas_auth")?.value;
    const r = await fetch(`${BASE}/api/branches/${params.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return new Response(await r.text(), { status: r.status });
  } catch (err) {
    console.error("DELETE Branch error:", err);
    return new Response("Failed to delete branch", { status: 500 });
  }
}
