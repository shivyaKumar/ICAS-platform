"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden text-center bg-gradient-to-br from-[#fffdf5] via-[#fff7db] to-[#ffe2a4]">
      {/* Layered gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 900"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gold-wave" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f9d976" />
              <stop offset="100%" stopColor="#f39c12" />
            </linearGradient>
            <linearGradient id="amber-swoosh" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffefb0" />
              <stop offset="45%" stopColor="#ffcc33" />
              <stop offset="100%" stopColor="#e19d00" />
            </linearGradient>
          </defs>

          <path
            d="M1440,0 L1440,900 L840,900 C1040,590 1200,320 1440,140 Z"
            fill="url(#gold-wave)"
            opacity="0.95"
          />
          <path
            d="M0,900 L0,540 C220,620 500,520 780,360 C1000,236 1180,220 1440,360 L1440,900 Z"
            fill="url(#amber-swoosh)"
            opacity="0.9"
          />
          <path
            d="M-40,620 C160,700 380,640 620,480 C800,360 1020,360 1240,520 C1080,720 820,880 460,940 C200,980 -20,860 -40,620 Z"
            fill="#fff3c4"
            opacity="0.85"
          />
          <circle cx="120" cy="140" r="180" fill="#fff8dc" opacity="0.5" />
          <circle cx="1320" cy="760" r="220" fill="#ffe59b" opacity="0.55" />
        </svg>
      </div>

      {/* 404 Section */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 mt-8 px-4 sm:px-10 z-10 w-full max-w-[95%] md:max-w-[80%]">
        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-sm sm:max-w-md text-left"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 mb-3 leading-none">
            Oops!
          </h1>
          <p className="text-gray-700 mb-6 text-sm sm:text-base md:text-lg leading-relaxed">
            The page you’re looking for doesn’t exist, was moved, or is temporarily unavailable.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#F4B400] text-black font-semibold px-4 sm:px-5 md:px-6 py-2 sm:py-3 rounded-md shadow-sm hover:shadow-md hover:bg-[#e0a800] transition-all text-xs sm:text-sm md:text-base"
          >
            <ArrowLeft size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
            Go Back
          </Link>
        </motion.div>

        {/* Animated 404 with proper oval stage shadow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative flex flex-col items-center justify-center"
        >
          {/* 404 Text */}
          <motion.h1
            className="text-[80px] sm:text-[120px] md:text-[160px] lg:text-[200px] font-extrabold leading-none 
            bg-gradient-to-b from-[#f6c700] via-[#f4b400] to-[#a67600] text-transparent bg-clip-text 
            drop-shadow-[5px_7px_0_rgba(0,0,0,0.35)]"
            animate={{ y: [0, -6, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2.8,
              ease: 'easeInOut',
            }}
          >
            404
          </motion.h1>

          {/* Crisp oval shadow under 404 */}
            <motion.div
            className="absolute bottom-[-25px] sm:bottom-[-35px] w-[140px] sm:w-[200px] md:w-[240px] h-[22px]
                        bg-gradient-to-b from-black/50 to-transparent rounded-[50%] opacity-70"
            animate={{
                scaleX: [1, 1.05, 1],
                opacity: [0.6, 0.8, 0.6],
            }}
            transition={{
                repeat: Infinity,
                duration: 2.8,
                ease: 'easeInOut',
            }}
            />
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="mt-16 sm:mt-20 text-[10px] sm:text-xs md:text-sm text-gray-600 z-10 text-center px-4">
        © {new Date().getFullYear()} Carpenters Compliance Platform
      </footer>
    </main>
  );
}
