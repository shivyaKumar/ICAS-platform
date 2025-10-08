"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NewsArticle {
  title: string;
  url: string;
  source?: { name?: string };
  publishedAt?: string;
}

export default function FijiNewsTicker() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch Fiji news from backend RSS API
  async function loadNews() {
    try {
      setLoading(true);
      const res = await fetch("/api/fiji-news");
      const data = await res.json();
      if (Array.isArray(data.articles)) setArticles(data.articles.slice(0, 8));
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  // Initial load + auto-refresh every 60 minutes
  useEffect(() => {
    loadNews();
    const hourlyRefresh = setInterval(loadNews, 60 * 60 * 1000);
    return () => clearInterval(hourlyRefresh);
  }, []);

  // Rotate headline every 7 seconds
  useEffect(() => {
    if (articles.length === 0) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % articles.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [articles]);

  return (
    <div className="w-full bg-yellow-50 border-b border-yellow-200 py-2 px-4 flex items-center overflow-hidden rounded-t-xl shadow-sm">
      <span className="text-yellow-700 font-semibold mr-3">🇫🇯 Fiji News:</span>
      <div className="relative flex-1 overflow-hidden h-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.p
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 text-sm italic"
            >
              Fetching latest headlines from Fiji...
            </motion.p>
          ) : articles.length > 0 ? (
            <motion.a
              key={index}
              href={articles[index].url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 text-sm text-gray-800 hover:text-yellow-700 font-medium truncate"
            >
              {articles[index].title}
            </motion.a>
          ) : (
            <motion.p
              key="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 text-sm italic"
            >
              No Fiji news available at this moment.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
