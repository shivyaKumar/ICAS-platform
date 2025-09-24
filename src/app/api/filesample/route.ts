import { cookies } from "next/headers";

const BASE = "http://127.0.0.1:5275";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(process.env.JWT_COOKIE ?? "icas_auth")?.value;

    if (!token) {
      return new Response("Unauthorized: No token", { status: 401 });
    }

    const res = await fetch(`${BASE}/api/frameworks/download-sample`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return new Response("Failed to download sample", { status: res.status });
    }

    const blob = await res.blob();
    return new Response(blob, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=Framework_Sample.xlsx",
      },
    });
  } catch (err) {
    console.error("Download sample error:", err);
    return new Response("Error downloading file", { status: 500 });
  }
}
