"use client";

import { Home, Shield, FileText, Settings } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md border-r min-h-screen p-6">
      <nav className="space-y-4">
        <Link href="/admin/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium">
          <Home size={20} /> <span>Dashboard</span>
        </Link>
        <Link href="/admin/compliance" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium">
          <Shield size={20} /> <span>Compliance</span>
        </Link>
        <Link href="/admin/audits" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium">
          <FileText size={20} /> <span>Audits</span>
        </Link>
        <Link href="/admin/settings" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium">
          <Settings size={20} /> <span>Settings</span>
        </Link>
      </nav>
    </aside>
  );
}
