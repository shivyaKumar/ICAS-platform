"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react"; 
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  // --------------------------
  // State variables
  // --------------------------
  const [email, setEmail] = useState("");        
  const [password, setPassword] = useState("");  
  const [error, setError] = useState("");        
  const router = useRouter();                     


  // --------------------------
  // Handle login form submission
  // --------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 

    // Call login API route with email & password
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const res = await response.json();

    if (res.success) {
      // Save user role in localStorage (for session simulation)
      localStorage.setItem("role", res.role ?? "");

      // Redirect to dashboard
      router.push("/admin/dashboard");
    } else {
      // Show error message
      setError(res.message ?? "An unknown error occurred.");
    }
  };


  return (
    <div className="flex min-h-screen">
      {/* LEFT SIDE: Branding & Animation */}
      <div className="w-1/2 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 via-yellow-500 to-black relative overflow-hidden">
        {/* Decorative animated circles */}
        <div className="absolute w-72 h-72 bg-yellow-300 rounded-full top-20 left-10 animate-pulse opacity-30"></div>
        <div className="absolute w-96 h-96 bg-black rounded-full bottom-10 right-10 animate-bounce-slow opacity-20"></div>

        {/* Carpenters Logo + Welcome Text */}
        <div className="z-10 text-center">
          <Image
            src="/carpenters.png"
            alt="Carpenters Logo"
            width={120}
            height={120}
            className="mx-auto animate-spin-slow"
          />
          <h1 className="text-3xl font-bold text-white mt-4 animate-fadeIn">
            Welcome to Carpenters
          </h1>
          <p className="text-yellow-200 mt-3 text-lg animate-fadeIn">
            Compliance Management System
          </p>
          <p className="text-yellow-200 mt-1 text-lg animate-fadeIn">
            Access your compliance dashboard to view security frameworks, monitor risks, and track audit processes.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-1/2 flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          {/* Title + Shield Icon */}
          <div className="flex flex-col items-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-yellow-500 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3l7 4v6c0 5-3 9-7 9s-7-4-7-9V7l7-4z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800">Compliance Portal</h2>
            <p className="text-sm text-gray-500">
              Sign in to access the compliance management system
            </p>
          </div>

          {/* Show error if login fails */}
          {error && (
            <p className="text-red-500 text-sm mb-3">{error}</p>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 text-left">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-400 focus:border-yellow-400 text-sm text-gray-800 placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 text-left">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-400 focus:border-yellow-400 text-sm text-gray-800 placeholder-gray-400"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 text-gray-600">
                <input type="checkbox" className="h-4 w-4 text-yellow-500" />
                <span>Keep me signed in</span>
              </label>
              <a href="#" className="text-yellow-600 hover:underline">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-md font-semibold flex items-center justify-center space-x-2 hover:bg-gray-800 transition"
            >
              <span>Sign In</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-400">
            © 2025 Carpenters. All rights reserved.
          </p>
        </div>
      </div>

      {/* Custom Animations (CSS-in-JS) */}
      <style jsx>{`
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 2s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-bounce-slow {
          animation: bounceSlow 6s infinite ease-in-out;
        }
        @keyframes bounceSlow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-50px);
          }
        }
      `}</style>
    </div>
  );
}
