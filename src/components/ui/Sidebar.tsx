"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, Menu } from "lucide-react";
import { useState } from "react";

export type NavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

type SidebarProps = {
  navigation: NavigationItem[];
  open: boolean; // mobile
  onClose: () => void;
};

export default function Sidebar({ navigation, open, onClose }: SidebarProps) {
  const pathname = usePathname() ?? "/";
  const [collapsed, setCollapsed] = useState(false); // desktop collapse toggle

  const Nav = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className="space-y-2 mt-2">
      {navigation.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={mobile ? onClose : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-gray-700 text-yellow-400 font-semibold"
                : "text-gray-300 hover:text-yellow-400 hover:bg-gray-700"
            }`}
          >
            <item.icon
              className={`h-5 w-5 shrink-0 ${
                isActive ? "text-yellow-400" : "text-gray-400"
              }`}
            />
            {!collapsed && <span className="truncate">{item.name}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ---------- Desktop Sidebar ---------- */}
      <aside
        className={`hidden md:flex flex-col bg-gray-800 shadow-lg transition-all duration-300 ${
          collapsed ? "w-16" : "w-52"
        }`}
      >
        {/* Top Drawer Toggle — Properly Centered */}
        <div className="flex items-center justify-center h-16 border-b border-gray-700 bg-gray-900/60">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md hover:bg-gray-700/80 hover:ring-2 hover:ring-yellow-400/40 transition"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Menu className="w-5 h-5 text-yellow-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          <Nav />
        </div>
      </aside>

      {/* ---------- Mobile Overlay ---------- */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* ---------- Mobile Drawer ---------- */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-56 p-4 bg-gray-800 shadow-xl transform transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <Nav mobile />
      </div>
    </>
  );
}
