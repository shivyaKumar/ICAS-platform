"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Menu, Search, X } from "lucide-react";

export default function AdminHeader({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close the small search panel on Escape
  useEffect(() => {
    if (!mobileSearchOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileSearchOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileSearchOpen]);

  // Close if clicking outside the panel
  useEffect(() => {
    if (!mobileSearchOpen) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [mobileSearchOpen]);

  return (
    <header className="relative flex items-center justify-between bg-primary border-b px-3 md:px-6 py-3 md:py-4 shadow-md">
      {/* Left: Hamburger + Logo + Branding */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <button
          className="md:hidden p-2 -ml-1 rounded hover:bg-black/5"
          aria-label="Open menu"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5 text-black" />
        </button>

        <Image
          src="/carpenters.png"
          alt="Carpenters Logo"
          width={40}
          height={40}
          className="rounded-md md:w-12 md:h-12 shrink-0"
        />

        <div className="leading-tight truncate">
          <h1 className="font-heading font-bold text-base md:text-xl text-black truncate">
            Carpenters Fiji
          </h1>
          <p className="text-xs md:text-sm text-gray-800 font-medium truncate">
            Compliance Management System
          </p>
        </div>
      </div>

      {/* Right: Search + Avatar */}
      <div className="flex items-center gap-3 md:gap-5 shrink-0">
        {/* Desktop search (inline) */}
        <div className="relative hidden md:block min-w-[160px] lg:min-w-[220px]">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg 
                       text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        </div>

        {/* Mobile search icon (opens compact panel) */}
        <button
          className="md:hidden p-2 rounded hover:bg-black/5"
          aria-label="Open search"
          onClick={() => setMobileSearchOpen((v) => !v)}
        >
          <Search className="h-5 w-5 text-black" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-800 
                        flex items-center justify-center text-white font-semibold cursor-pointer 
                        hover:opacity-90 transition">
          N
        </div>

        {/* Mobile compact search panel (no dark overlay) */}
        {mobileSearchOpen && (
          <div
            ref={panelRef}
            className="absolute right-3 left-3 top-full mt-2 md:hidden bg-white/95 backdrop-blur 
                       border border-gray-200 shadow-xl rounded-xl p-2"
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search…"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg 
                             text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              </div>
              <button
                className="p-2 rounded hover:bg-gray-100"
                aria-label="Close search"
                onClick={() => setMobileSearchOpen(false)}
              >
                <X className="h-4 w-4 text-gray-700" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
