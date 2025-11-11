import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

/* ---------- Types ---------- */
interface RssItem {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  "content:encoded"?: string;
  "media:content"?: { "@_url"?: string };
  enclosure?: { "@_url"?: string };
}

interface RssFeed {
  rss?: {
    channel?: {
      title?: string;
      item?: RssItem[];
    };
  };
}

interface Article {
  title: string;
  url: string;
  description: string;
  publishedAt: string;
  urlToImage: string | null;
  source: { name: string };
}

/* ---------- Decode HTML entities ---------- */
function decodeEntities(str = ""): string {
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/* ---------- Extract OG image ---------- */
async function fetchOGImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const match =
      html.match(/<meta property="og:image" content="(.*?)"/i) ||
      html.match(/<meta name="twitter:image" content="(.*?)"/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/* ---------- Extract <img> from HTML body ---------- */
function extractImageFromHtml(html: string): string | null {
  const match = html.match(/<img[^>]+src="([^">]+)"/i);
  return match ? match[1] : null;
}

/* ---------- Main Handler ---------- */
export async function GET() {
  try {
    const sources = [
      "https://rss.app/feeds/qPP8O0NinLXYxsf9.xml", // Fiji Times
      "https://rss.app/feeds/xGJHr5ssY2FUZx8K.xml", // FBC News
      "https://rss.app/feeds/4fpKNl0fP7Vh85cR.xml", // FijiVillage
    ];

    // Fetch all RSS feeds in parallel
    const results = await Promise.allSettled(
      sources.map((url) => fetch(url).then((r) => r.text()))
    );

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });

    const articles: Article[] = [];

    for (const res of results) {
      if (res.status !== "fulfilled") continue;

      try {
        const feed = parser.parse(res.value) as RssFeed;
        const items = feed?.rss?.channel?.item ?? [];

        for (const item of items) {
          const rawDesc = item.description || item["content:encoded"] || "";
          const cleanDesc = decodeEntities(
            rawDesc.replace(/<[^>]*>/g, "").slice(0, 200) + "..."
          );

          const image =
            item["media:content"]?.["@_url"] ||
            item.enclosure?.["@_url"] ||
            extractImageFromHtml(item["content:encoded"] || item.description || "") ||
            (await fetchOGImage(item.link || ""));

          articles.push({
            title: decodeEntities(item.title || "Untitled"),
            url: item.link || "#",
            description: cleanDesc,
            publishedAt: item.pubDate || new Date().toISOString(),
            urlToImage: image || null,
            source: { name: feed?.rss?.channel?.title || "Fiji News" },
          });
        }
      } catch (err) {
        console.error("RSS parse failed:", err);
      }
    }

    /* ---------- Sort, Mix, Slice ---------- */
    // Sort by date (newest first)
    const sorted = articles.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Slightly shuffle to get variety
    const mixed = sorted.sort(() => 0.5 - Math.random());

    // Take the latest 6
    const finalArticles = mixed.slice(0, 6);

    /* ---------- Fallback ---------- */
    const fallback =
      finalArticles.length > 0
        ? finalArticles
        : [
            {
              title: "Fiji Ports Modernization Project moves to next phase",
              url: "#",
              description:
                "Fiji’s maritime infrastructure advances to the next stage with new port facilities and sustainability efforts.",
              publishedAt: new Date().toISOString(),
              urlToImage: null,
              source: { name: "Fiji Ports Authority" },
            },
          ];

    return NextResponse.json({ articles: fallback });
  } catch (err) {
    console.error("Fiji news fetch failed:", err);
    return NextResponse.json({ articles: [] }, { status: 500 });
  }
}
