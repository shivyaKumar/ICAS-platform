import { cookies } from "next/headers";

const BASE = "http://127.0.0.1:5275";

// Get division by ID
export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = (await cookies()).get("icas_auth")?.value;
    const { id } = await context.params;

    const r = await fetch(`${BASE}/api/divisions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return new Response(await r.text(), { status: r.status });
  } catch (err) {
    console.error("GET Division error:", err);
    return new Response("Failed to fetch division", { status: 500 });
  }
}

// Update division by ID
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = (await cookies()).get("icas_auth")?.value;
    const { id } = await context.params;
    const body = await req.text();

    const r = await fetch(`${BASE}/api/divisions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    return new Response(await r.text(), { status: r.status });
  } catch (err) {
    console.error("PUT Division error:", err);
    return new Response("Failed to update division", { status: 500 });
  }
}

// Delete division by ID
export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = (await cookies()).get("icas_auth")?.value;
    const { id } = await context.params;

    const r = await fetch(`${BASE}/api/divisions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (r.status === 204) {
      //Handle empty no-content response
      return new Response(null, { status: 204 });
    }

    return new Response(await r.text(), { status: r.status });
  } catch (err) {
    console.error("DELETE Division error:", err);
    return new Response("Failed to delete division", { status: 500 });
  }
}
