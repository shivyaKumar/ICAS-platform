// src/app/admin/layout.tsx
"use client";

import React, { useState } from "react";
import Header from "@/components/ui/Header";
import Sidebar, { type NavigationItem } from "@/components/ui/Sidebar";
import { Shield, BarChart3, FileText, Users } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminNavigation: NavigationItem[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
    { name: "Assessments", href: "/admin/assessments", icon: Shield },
    { name: "Frameworks", href: "/admin/frameworks", icon: FileText },
    { name: "User Management", href: "/admin/user-management", icon: Users },
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header with sidebar toggle */}
      <Header onToggleSidebar={() => setSidebarOpen((s) => !s)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          navigation={adminNavigation}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content area */}
        <main className="flex-1 min-w-0 overflow-y-auto px-4 md:px-5 lg:px-6 py-4 bg-gray-50">
          <div className="min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
