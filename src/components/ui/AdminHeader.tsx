"use client";

import Image from "next/image";
import { Search } from "lucide-react";

export default function AdminHeader() {
  return (
    <header className="flex items-center justify-between bg-primary border-b px-6 py-4 shadow-md">
      {/* Logo + Branding */}
      <div className="flex items-center space-x-4">
        {/* Bigger logo */}
        <Image
          src="/carpenters.png"
          alt="Carpenters Logo"
          width={48}
          height={48}
          className="rounded-md"
        />
        <div>
          <h1 className="font-heading font-bold text-xl text-black">
            Carpenters Fiji
          </h1>
          <p className="text-sm text-gray-800 font-medium">
            Compliance Management System
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-5">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        </div>

        {/* Profile Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-semibold cursor-pointer hover:opacity-90 transition">
          N
        </div>
      </div>
    </header>
  );
}
