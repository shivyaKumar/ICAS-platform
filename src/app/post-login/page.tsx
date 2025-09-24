"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PostLoginPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkRole() {
      const res = await fetch("/api/me", { credentials: "include" });
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      const role = data.roles?.[0] ?? "User";

      if (role === "Super Admin" || role === "IT Admin" || role === "Admin") {
        router.push("/admin/dashboard");
      } else if (role === "Standard User") {
        router.push("/staff/dashboard");
      } else {
        router.push("/login");
      }
    }
    checkRole();
  }, [router]);

  return <p className="p-6">Redirecting...</p>;
}
