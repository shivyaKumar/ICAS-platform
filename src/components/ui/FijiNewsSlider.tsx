"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface NewsArticle {
  title: string;
  url: string;
  publishedAt: string;
  source: { name: string };
  urlToImage?: string | null;
  description?: string;
}

/* ---------- Fiji News Slider ---------- */
export default function FijiNewsSlider() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [index, setIndex] = useState(0);

  // Load Fiji news
  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch("/api/fiji-news", { cache: "no-store" });
        const data = await res.json();
        setArticles(data.articles?.slice(0, 6) || []);
      } catch (err) {
        console.error("Failed to load Fiji news:", err);
      }
    }
    loadNews();
  }, []);

  // Auto-slide every 7 seconds
  useEffect(() => {
    if (articles.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % articles.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [articles]);

  if (articles.length === 0) {
    return (
      <div className="w-full bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center text-gray-600">
        Loading latest Fiji news…
      </div>
    );
  }

  const article = articles[index];

  return (
    <div className="relative w-full h-64 md:h-72 rounded-xl overflow-hidden shadow-md bg-white border border-gray-100 transition-all">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 flex flex-col md:flex-row"
        >
          {/* ---------- Image Section ---------- */}
          {article.urlToImage ? (
            <div className="relative w-full md:w-1/2 h-40 md:h-auto">
              <Image
                src={article.urlToImage}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          ) : (
            <div className="w-full md:w-1/2 bg-yellow-100 flex items-center justify-center text-yellow-700 font-medium">
              No Image Available
            </div>
          )}

          {/* ---------- Text Section ---------- */}
          <div className="flex flex-col justify-between p-5 md:w-1/2">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 line-clamp-2">
                {article.title}
              </h3>
              {article.description && (
                <p className="text-sm text-gray-700 mt-2 leading-snug line-clamp-3">
                  {article.description.replace(/<\/?[^>]+(>|$)/g, "")}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span>{article.source?.name}</span>
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-indigo-600 hover:text-indigo-800 font-medium"
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
              i === index ? "bg-yellow-500 scale-110" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
