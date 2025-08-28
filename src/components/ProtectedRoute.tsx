"use client";

import { useAuth } from "@/context/AuthContext"; // adjust path if needed
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !role) {
      router.replace("/login");
    }
  }, [isLoading, role, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!role) {
    return null; // prevent flicker while redirecting
  }

  return <>{children}</>;
}
