"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  href?: string;
  showLabel?: boolean; // optional: if you want to hide text later
}

export default function BackButton({ href, showLabel = true }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) router.push(href);
    else router.back();
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 group"
    >
      {/* Circle Icon */}
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#FACC15] shadow-md hover:shadow-lg transition-shadow">
        <ArrowLeft className="h-5 w-5 text-black group-hover:-translate-x-0.5 transition-transform duration-150" />
      </div>

      {/* Text (optional) */}
      {showLabel && (
        <span className="text-black font-medium hover:underline transition-colors">
          Back
        </span>
      )}
    </button>
  );
}
