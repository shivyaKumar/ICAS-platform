"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Menu, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Load logged-in user info
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUserEmail(data.email);
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    }
    fetchUser();
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      router.push("/login"); // SPA-friendly redirect
    }
  };

  const userInitials = userEmail ? userEmail.charAt(0).toUpperCase() : "?";

  // Close dropdown if clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="relative flex items-center justify-between bg-primary border-b px-3 md:px-6 py-3 md:py-4 shadow-md">
      {/* Left: Sidebar toggle + Logo */}
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

      {/* Right: User Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-black/20 transition"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          <span className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-gray-800 text-white font-semibold">
            {userInitials}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-700 transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {dropdownOpen && (
          <div
            className="absolute right-0 mt-2 max-w-xs bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            style={{ minWidth: "12rem" }}
          >
            <div className="px-4 py-2 text-sm text-gray-700 border-b break-words">
              {userEmail ?? "Loading..."}
            </div>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
