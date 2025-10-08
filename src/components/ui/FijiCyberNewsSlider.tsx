"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface NewsArticle {
  title: string;
  url: string;
  publishedRaw: string;
  source: { name: string };
  urlToImage?: string | null;
  description?: string;
}

/* ---------- Cybersecurity News Slider ---------- */
export default function CyberNewsSlider() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch("/api/cyber-news", { cache: "no-store" });
        const data = await res.json();
        setArticles(data.articles?.slice(0, 6) || []);
      } catch (err) {
        console.error("Failed to load Cybersecurity news:", err);
      }
    }
    loadNews();
  }, []);

  useEffect(() => {
    if (articles.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % articles.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [articles]);

  if (articles.length === 0)
    return (
      <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-center text-gray-600">
        Loading latest Cybersecurity updates…
      </div>
    );

  const article = articles[index];
  const cleanDate = article.publishedRaw
    ? article.publishedRaw.replace(/(\d{1,2}:\d{2}.*)/, "").trim()
    : "Date unavailable";

  const hasImage = article.urlToImage && article.urlToImage.trim() !== "";

  return (
    <div className="relative w-full h-auto md:h-72 rounded-xl overflow-hidden shadow-md bg-white border border-gray-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.8 }}
          className={`absolute inset-0 flex flex-col md:flex-row ${!hasImage ? "items-start" : ""}`}
        >
          {/* ---------- Image (only if available) ---------- */}
          {hasImage && (
            <div className="relative w-full md:w-1/2 h-40 md:h-auto">
              <Image
                src={article.urlToImage!}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          )}

          {/* ---------- Text Section ---------- */}
          <div
            className={`flex flex-col justify-between p-5 ${
              hasImage ? "md:w-1/2" : "w-full"
            }`}
          >
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                {article.description?.replace(/<\/?[^>]+(>|$)/g, "") ||
                  "Click below to read full article."}
              </p>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span>{article.source?.name}</span>
              <span>{cleanDate}</span>
            </div>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm mt-2"
            >
              View Full Article →
            </a>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ---------- Indicators ---------- */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2">
        {articles.map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === index ? "bg-blue-500 scale-110" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
