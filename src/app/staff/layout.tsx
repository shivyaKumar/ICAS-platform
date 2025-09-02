"use client";

import React, { useState } from "react";
import Header from "@/components/ui/Header";
import Sidebar, { type NavigationItem } from "@/components/ui/Sidebar";
import { LayoutDashboard, Shield, CheckCircle2 } from "lucide-react";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Staff-specific nav (kept minimal per your scope)
  const staffNavigation: NavigationItem[] = [
    { name: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
    { name: "My Task", href: "/staff/my-task", icon: Shield },
    { name: "Completed", href: "/staff/completed", icon: CheckCircle2 },
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header with hamburger that toggles the mobile drawer */}
      <Header onToggleSidebar={() => setSidebarOpen((s) => !s)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Shared Sidebar: desktop rail + mobile drawer */}
        <Sidebar
          navigation={staffNavigation}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Content */}
        <main className="flex-1 min-w-0 overflow-y-auto px-4 md:px-5 lg:px-6 py-4 bg-gray-50">
          <div className="min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
