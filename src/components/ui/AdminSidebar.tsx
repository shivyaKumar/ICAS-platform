"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, BarChart3, FileText, Users, X } from "lucide-react";
import { useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
  { name: "Assessments", href: "/admin/assessments", icon: Shield },
  { name: "Frameworks", href: "/admin/frameworks", icon: FileText },
  { name: "User Management", href: "/admin/user-management", icon: Users },
];

export default function Sidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname() ?? "/";

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close drawer on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const Nav = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={mobile ? "mt-6 space-y-2" : "space-y-2"}>
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
            <item.icon className={`h-5 w-5 ${isActive ? "text-yellow-400" : "text-gray-400"}`} />
            <span className="truncate">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop rail (>= md) */}
      <aside className="hidden md:block w-52 lg:w-50 p-4 overflow-y-auto shadow-lg bg-gray-800">
        <Nav />
      </aside>

      {/* Mobile drawer (< md) */}
      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 p-4 bg-gray-800 shadow-xl transform transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <button
          className="absolute top-3 right-3 text-gray-300 hover:text-white"
          aria-label="Close menu"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        <Nav mobile />
      </div>
    </>
  );
}
