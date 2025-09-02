"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: ("admin" | "staff")[];
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || !allowedRoles.includes(user.role)) {
      router.push("/login");
    }
  }, [user, allowedRoles, router]);

  if (!user || !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
