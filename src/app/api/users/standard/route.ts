import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL ?? "http://127.0.0.1:5275";

function matches(value: string | undefined, target: string | undefined) {
  if (!target) return true;
  if (!value) return false;
  return value.toLowerCase() === target.toLowerCase();
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("icas_auth")?.value;
    const url = new URL(req.url);

    const branchId = url.searchParams.get("branchId");
    const division = url.searchParams.get("division");
    const location = url.searchParams.get("location");

    const response = await fetch(`${API_BASE}/api/users`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ message: text || "Failed to load users" }, { status: response.status });
    }

    const payload = await response.json();
    const result = Array.isArray(payload)
      ? payload.filter((user) => {
          const role = typeof user?.role === "string" ? user.role : "";
          if (role !== "Standard User") return false;

          const userBranchId = typeof user?.branchId === "number" ? String(user.branchId) : undefined;
          const userDivision = typeof user?.divisionName === "string" ? user.divisionName : undefined;
          const userLocation = typeof user?.branch?.location === "string" ? user.branch.location : undefined;

          const branchMatches = branchId ? branchId === userBranchId : true;
          const divisionMatches = matches(userDivision, division ?? undefined);
          const locationMatches = matches(userLocation, location ?? undefined);
          return branchMatches && divisionMatches && locationMatches;
        })
      : [];

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Users/Standard] proxy failed", error);
    return NextResponse.json({ message: "Unable to load standard users" }, { status: 500 });
  }
}
