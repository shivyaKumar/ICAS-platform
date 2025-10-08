"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled Application Error:", error);
  }, [error]);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden text-center bg-gradient-to-br from-[#fffdf5] via-[#fff7db] to-[#ffe2a4] px-6">
      {/* Background gradient for consistency */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 900"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="carpenters-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD95A" />
              <stop offset="100%" stopColor="#F4B400" />
            </linearGradient>
          </defs>

          {/* Soft background wave */}
          <path
            d="M0,700 Q720,600 1440,800 L1440,900 L0,900 Z"
            fill="url(#carpenters-gold)"
            opacity="0.75"
          />
        </svg>
      </div>

      {/* Clean centered section */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center justify-center gap-5 px-6 py-10 sm:px-10 sm:py-12 bg-white/70 backdrop-blur-md border border-[#f4b400]/40 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] max-w-md w-full"
      >
        <AlertTriangle
          className="text-[#F4B400] drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]"
          size={64}
        />

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
          Something Went Wrong
        </h1>
        <p className="text-gray-700 text-sm sm:text-base max-w-sm leading-relaxed">
          We encountered an unexpected issue. Please try again or go back to the
          home page.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-[#F4B400] text-black font-semibold px-6 py-3 rounded-md shadow-sm hover:shadow-md hover:bg-[#e0a800] transition-all text-sm"
          >
            <RotateCcw size={18} />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-medium px-6 py-3 rounded-md hover:bg-gray-100 transition-all text-sm"
          >
            Go Home
          </Link>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="mt-10 text-xs sm:text-sm text-gray-600">
        © {new Date().getFullYear()} Carpenters Compliance Platform
      </footer>
    </main>
  );
}
