// src/app/staff/page.tsx
"use client";

import { redirect } from "next/navigation";

// No ProtectedRoute wrapper here
export default function StaffHomePage() {
  redirect("/staff/dashboard");
}
