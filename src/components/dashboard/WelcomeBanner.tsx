"use client";

import { motion } from "framer-motion";
import React from "react";

export function WelcomeBanner({ name }: { name?: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 sm:p-8 shadow-xl text-white">
      {/* ---------- Subtle moving golden light sweep ---------- */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,215,0,0.25)_0%,rgba(255,215,0,0)_40%,rgba(255,215,0,0.25)_80%)]"
        animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
      />

      {/* ---------- Ambient golden glow ---------- */}
      <motion.div
        className="absolute top-[-120px] left-[-120px] w-80 h-80 bg-yellow-500/30 blur-3xl rounded-full opacity-30"
        animate={{ x: [0, 80, -60, 0], y: [0, 40, -40, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-120px] right-[-120px] w-96 h-96 bg-yellow-300/20 blur-3xl rounded-full opacity-30"
        animate={{ x: [0, -70, 70, 0], y: [0, -30, 30, 0] }}
        transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
      />

      {/* ---------- Floating light particles ---------- */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-70 blur-[1px]"
          style={{
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 90}%`,
          }}
          animate={{
            y: [0, -25, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 6 + Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8,
          }}
        />
      ))}

      {/* ---------- Text Content ---------- */}
      <div className="relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[1.3rem] sm:text-[1.6rem] md:text-[1.8rem] font-semibold tracking-tight"
        >
          Welcome back,{" "}
          <span className="text-yellow-400 font-bold">
            {name || "User"}!
          </span>
        </motion.h1>
        </div>
    </div>
  );
}
