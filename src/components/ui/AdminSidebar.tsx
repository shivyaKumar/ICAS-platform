"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, BarChart3, FileText, Users } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
  { name: "Assessments", href: "/admin/assessments", icon: Shield },
  { name: "Frameworks", href: "/admin/frameworks", icon: FileText },
  { name: "User Management", href: "/admin/user-management", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname() ?? "/";

  return (
    <aside className="w-64 p-4 overflow-y-auto shadow-lg bg-gray-800">
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
                  ? "bg-gray-700 text-yellow-400 font-semibold"
                  : "text-gray-300 hover:text-yellow-400 hover:bg-gray-700"
              }`}
            >
              <item.icon
                className={`h-5 w-5 transition-colors ${
                  isActive
                    ? "text-yellow-400"
                    : "text-gray-400 group-hover:text-yellow-400"
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
