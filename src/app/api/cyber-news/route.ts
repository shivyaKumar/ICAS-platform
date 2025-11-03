import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

/* ---------- Dynamic Route Config ---------- */
export const dynamic = "force-dynamic"; // always fetch fresh

/* ---------- Cache Settings ---------- */
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes cache for better freshness

interface Article {
  title: string;
  url: string;
  description: string;
  publishedRaw: string;
  urlToImage: string | null;
  source: { name: string };
}

interface CachedResponse {
  articles: Article[];
}

let cachedData: CachedResponse | null = null;
let lastFetched = 0;

/* ---------- Feed Types ---------- */
interface FeedEntry {
  title?: string;
  link?: string;
  pubDate?: string;
  updated?: string;
  description?: string;
  summary?: string;
  "media:content"?: { "@_url"?: string };
  enclosure?: { "@_url"?: string };
}

interface FeedSource {
  rss?: {
    channel?: {
      title?: string;
      link?: string;
      item?: FeedEntry[] | FeedEntry;
    };
  };
  feed?: {
    title?: string;
    entry?: FeedEntry[] | FeedEntry;
  };
}

/* ---------- Helpers ---------- */
function decodeEntities(str = ""): string {
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function fetchOGImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const html = await res.text();
    const match =
      html.match(/<meta property="og:image" content="(.*?)"/i) ||
      html.match(/<meta name="twitter:image" content="(.*?)"/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/* ---------- Fetch & Parse Feeds ---------- */
async function fetchFeeds(): Promise<Article[]> {
  const sources = [
    { name: "The Hacker News", url: "https://rss.app/feeds/Qqfs8GWJy94Kgtgm.xml" },
    { name: "BleepingComputer", url: "https://rss.app/feeds/nvXuEMnMxgB1n7v1.xml" },
    { name: "SecurityWeek", url: "https://rss.app/feeds/nvvNnuzMFsHNUMW0.xml" },
    // { name: "CISA", url: "https://rss.app/feeds/k8cniJt1WSFvKEp5.xml" },
  ];

  const results = await Promise.allSettled(
    sources.map((s) => fetch(s.url, { cache: "no-store" }).then((r) => r.text()))
  );

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const collected: Article[] = [];

  // Patterns to detect placeholder or invalid images
  const invalidImagePatterns = [
    "default",
    "avatar",
    "blank",
    "placeholder",
    "noimage",
  ];

  for (let i = 0; i < results.length; i++) {
    const res = results[i];
    if (res.status !== "fulfilled") continue;
    const src = sources[i];

    try {
      const xml = parser.parse(res.value) as FeedSource;
      let entries: FeedEntry[] = [];

      // Detect RSS or Atom
      if (xml.rss?.channel?.item) {
        entries = Array.isArray(xml.rss.channel.item)
          ? xml.rss.channel.item
          : [xml.rss.channel.item];
      } else if (xml.feed?.entry) {
        entries = Array.isArray(xml.feed.entry)
          ? xml.feed.entry
          : [xml.feed.entry];
      }

      for (const item of entries.slice(0, 4)) {
        const title = decodeEntities(
          (item.title || "").replace(/<\/?[^>]+(>|$)/g, "").trim()
        );
        const desc = decodeEntities(
          (item.description || item.summary || "")
            .replace(/<\/?[^>]+(>|$)/g, "")
            .trim()
        );

        // Try multiple ways to find a valid image
        const imageCandidate =
          item["media:content"]?.["@_url"] ||
          item.enclosure?.["@_url"] ||
          (await fetchOGImage(item.link || ""));

        const image =
          imageCandidate &&
          imageCandidate.startsWith("http") &&
          !invalidImagePatterns.some((p) =>
            imageCandidate.toLowerCase().includes(p)
          )
            ? imageCandidate
            : null;

        const published =
          (item.pubDate?.trim() || item.updated?.trim() || "").replace(
            /(\d{1,2}:\d{2}.*)/,
            ""
          );

        collected.push({
          title: title || "Untitled",
          url: item.link || "#",
          description: desc.length > 180 ? desc.slice(0, 180) + "..." : desc,
          publishedRaw: published,
          urlToImage: image,
          source: { name: src.name },
        });
      }
    } catch (err) {
      console.error(`Parse failed for ${src.name}:`, err);
    }
  }

  /* ---------- Deduplicate ---------- */
  const unique = Array.from(
    new Map(collected.map((a) => [a.title.toLowerCase(), a])).values()
  );

  /* ---------- Sort by date ---------- */
  const sorted = unique.sort(
    (a, b) =>
      new Date(b.publishedRaw).getTime() - new Date(a.publishedRaw).getTime()
  );

  /* ---------- Shuffle for variety ---------- */
  const shuffled = sorted
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);

  const final = shuffled.slice(0, 8);

  return (
    final.length > 0
      ? final
      : [
          {
            title: "No current cybersecurity alerts available",
            url: "#",
            description:
              "Check back later for the latest advisories, incidents, and updates.",
            publishedRaw: "",
            urlToImage: null,
            source: { name: "Cybersecurity Feed" },
          },
        ]
  );
}

/* ---------- Main Handler ---------- */
export async function GET() {
  try {
    const now = Date.now();

    // Serve from cache if valid
    if (cachedData && now - lastFetched < CACHE_TTL) {
      return NextResponse.json(cachedData, {
        headers: { "Cache-Control": "public, max-age=60" },
      });
    }

    // Fetch new feeds
    const articles = await fetchFeeds();

    cachedData = { articles };
    lastFetched = now;

    // Return fresh data
    return NextResponse.json(
      { articles },
      {
        headers: {
          "Cache-Control": "public, max-age=120, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("Cyber news fetch failed:", err);
    return NextResponse.json({ articles: [] }, { status: 500 });
  }
}
