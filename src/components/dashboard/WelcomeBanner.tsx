"use client";

import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { Manrope } from "next/font/google";
import robotAnimation from "@/../public/animations/Animated Robot.json";
import React from "react";

// Professional geometric sans-serif font (used in SaaS dashboards)
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export function WelcomeBanner({ name }: { name?: string }) {
  return (
    <div className="relative overflow-hidden flex items-center justify-between rounded-xl border border-gray-200 bg-gradient-to-br from-gray-900 via-gray-800 to-black px-6 sm:px-8 py-4 shadow-xl text-white min-h-[110px]">
      {/* ---------- Subtle moving golden light sweep ---------- */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,215,0,0.25)_0%,rgba(255,215,0,0)_40%,rgba(255,215,0,0.25)_80%)]"
        animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
      />

      {/* ---------- Ambient golden glow ---------- */}
      <motion.div
        className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-yellow-500/25 blur-3xl rounded-full opacity-30"
        animate={{ x: [0, 60, -40, 0], y: [0, 30, -30, 0] }}
        transition={{ repeat: Infinity, duration: 16, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-100px] right-[-100px] w-72 h-72 bg-yellow-300/20 blur-3xl rounded-full opacity-25"
        animate={{ x: [0, -60, 60, 0], y: [0, -25, 25, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
      />

      {/* ---------- Floating light particles ---------- */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full opacity-70 blur-[1px]"
          style={{
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 90}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 5 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.6,
          }}
        />
      ))}

      {/* ---------- Left: Text ---------- */}
      <div className="relative z-10 text-left flex-1">
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className={`${manrope.className} text-[1.6rem] sm:text-[1.9rem] md:text-[2rem] font-extrabold tracking-tight leading-tight`}
        >
          Welcome back,{" "}
          <span className="text-yellow-400 font-extrabold drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]">
            {name || "User"}!
          </span>
        </motion.h1>
      </div>

      {/* ---------- Right: Robot Assistant Animation ---------- */}
      <div className="relative z-10 flex justify-end w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="w-full h-full"
        >
          <Lottie animationData={robotAnimation} loop={true} />
        </motion.div>
      </div>
    </div>
  );
}
