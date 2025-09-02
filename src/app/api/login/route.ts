// src/app/api/login/route.ts

// Example pseudo-code for login
export async function POST(req: Request) {
  const { username, password } = await req.json();

  // Example: check credentials
  if (username === "admin" && password === "adminpass") {
    return Response.json({ id: "1", name: "Admin User", role: "admin" });
  }
  if (username === "staff" && password === "staffpass") {
    return Response.json({ id: "2", name: "Staff User", role: "staff" });
  }

  return Response.json({ error: "Invalid credentials" }, { status: 401 });
}
