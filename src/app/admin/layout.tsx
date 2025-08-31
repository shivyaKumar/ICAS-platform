"use client";

import React, { useState } from "react";
import Sidebar from "@/components/ui/AdminSidebar";
import AdminHeader from "@/components/ui/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header: pass toggle handler for mobile hamburger */}
      <AdminHeader onToggleSidebar={() => setSidebarOpen((s) => !s)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: desktop rail + mobile drawer */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content area — allow shrinking on narrow screens */}
        <main className="flex-1 min-w-0 overflow-y-auto px-4 md:px-5 lg:px-6 py-4 bg-gray-50">
          <div className="min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
