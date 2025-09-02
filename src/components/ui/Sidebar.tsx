"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export type NavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

type SidebarProps = {
  navigation: NavigationItem[];
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ navigation, open, onClose }: SidebarProps) {
  const pathname = usePathname() ?? "/";

  const Nav = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className="space-y-2">
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
              className={`h-5 w-5 ${
                isActive ? "text-yellow-400" : "text-gray-400"
              }`}
            />
            <span className="truncate">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden md:block w-52 p-4 overflow-y-auto shadow-lg bg-gray-800">
        <Nav />
      </aside>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* Mobile sliding drawer */}
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
