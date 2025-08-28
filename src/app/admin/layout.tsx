"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Shield, BarChart3, FileText, Users, Search } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
  { name: "Assessments", href: "/admin/assessments", icon: Shield },
  { name: "Frameworks", href: "/admin/frameworks", icon: FileText },
  { name: "User Management", href: "/admin/user-management", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between bg-yellow-400 border-b px-6 py-3 shadow-sm">
        {/* Logo + Branding */}
        <div className="flex items-center space-x-3">
          <Image src="/carpenters.png" alt="Carpenters Logo" width={32} height={32} />
          <div>
            <h1 className="font-heading font-bold text-lg">Carpenters Fiji</h1>
            <p className="text-xs text-muted-foreground">Compliance Management System</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="pl-8 pr-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring focus:ring-yellow-400/50"
            />
            <Search className="absolute left-2 top-2 h-4 w-4 text-gray-500" />
          </div>

          {/* Profile Avatar */}
          <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-white font-semibold cursor-pointer">
            {/* Replace with user initials OR profile image */}
            N
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className="w-64 p-4 overflow-y-auto shadow-lg"
          style={{ backgroundColor: "#011140" }} // <-- navy blue
        >
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-yellow-400 text-black font-semibold"
                      : "text-gray-300 hover:text-white hover:bg-blue-800"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
