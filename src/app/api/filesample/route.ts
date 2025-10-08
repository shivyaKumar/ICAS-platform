import { cookies } from "next/headers";

const BASE = process.env.API_BASE_URL ?? "http://127.0.0.1:5275";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(process.env.JWT_COOKIE ?? "icas_auth")?.value;

    if (!token) {
      return new Response("Unauthorized: No token provided", { status: 401 });
    }

    // Call backend endpoint for downloading sample
    const res = await fetch(`${BASE}/api/frameworks/download-sample`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return new Response(await res.text(), { status: res.status });
    }

    // Return backend response as Excel file
    const blob = await res.blob();
    return new Response(blob, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          "attachment; filename=Framework_Sample.xlsx",
      },
    });
  } catch (err) {
    console.error("Download sample error:", err);
    return new Response("Error downloading file", { status: 500 });
  }
}
