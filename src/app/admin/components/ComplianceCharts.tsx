"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type YearPoint = { year: number } & Record<string, number | null>;
type FrameworkMonth = { month: number } & Record<string, number>;
type FrameworkYearPayload = { year: number; series: FrameworkMonth[] };

const PALETTE = ["#06b6d4","#eab308","#8b5cf6","#10b981","#ef4444","#22c55e","#3b82f6","#a855f7","#f59e0b"];

function CustomTooltip({
  active, label, payload,
}: {
  active?: boolean;
  label?: string | number;
  payload?: Array<{ name: string; value: number; color: string }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-white/95 px-3 py-2 text-sm shadow">
      <div className="font-medium mb-1">{label}</div>
      <ul className="space-y-0.5">
        {payload.map((p, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-700">{p.name}</span>
            <span className="ml-auto font-semibold">
              {Number.isFinite(p.value) ? `${Math.round(p.value)}%` : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const isAbort = (e: unknown, signal: AbortSignal) =>
  signal.aborted ||
  (e instanceof DOMException && e.name === "AbortError") ||
  (e instanceof Error && /(abort|cancel)/i.test(e.message));

/** Average each framework across months; if no series, return year only (creates a gap). */
const toYearAverages = (payload: FrameworkYearPayload): YearPoint => {
  const { year, series } = payload;
  if (!series.length) return { year } as YearPoint; // no values → gaps
  const keys = Object.keys(series[0]).filter((k) => k !== "month");
  const row: YearPoint = { year };
  keys.forEach((k) => {
    const sum = series.reduce((acc, m) => acc + (m[k] as number), 0);
    row[k] = Math.round(sum / series.length);
  });
  return row;
};

export default function ComplianceCharts() {
  const [data, setData] = useState<YearPoint[]>([]);
  const [frameworkKeys, setFrameworkKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // 1) Get rolling years (API decides the window)
        const yrsRes = await fetch("/api/metrics/years", { cache: "no-store", signal: controller.signal });
        if (!yrsRes.ok) throw new Error(`/api/metrics/years → ${yrsRes.status} ${yrsRes.statusText}`);
        const { years } = (await yrsRes.json()) as { years: number[] };

        // 2) Fetch each year; skip ones that fail
        const settled = await Promise.allSettled(
          years.map(async (y) => {
            const r = await fetch(`/api/metrics/framework?year=${y}`, { cache: "no-store", signal: controller.signal });
            if (!r.ok) throw new Error(`/api/metrics/framework?year=${y} → ${r.status} ${r.statusText}`);
            return (await r.json()) as FrameworkYearPayload;
          })
        );

        const ok = settled
          .filter((r): r is PromiseFulfilledResult<FrameworkYearPayload> => r.status === "fulfilled")
          .map((r) => r.value);

        if (!ok.length) {
          setData([]);
          setFrameworkKeys([]);
          return;
        }

        // 3) Build rows and discover keys from the first non-empty year
        const rowsRaw = ok.map(toYearAverages).sort((a, b) => a.year - b.year);
        const firstNonEmptySeries = ok.find((p) => p.series.length)?.series[0] ?? null;
        const keys = firstNonEmptySeries ? Object.keys(firstNonEmptySeries).filter((k) => k !== "month") : [];

        // Ensure all rows contain all keys with nulls (so Recharts draws gaps cleanly)
        const rows: YearPoint[] = rowsRaw.map((r) => {
          const filled: YearPoint = { year: r.year };
          keys.forEach((k) => {
            filled[k] = (r as Record<string, number | null>)[k] ?? null;
          });
          return filled;
        });

        setData(rows);
        setFrameworkKeys(keys);
        setErr(null);
      } catch (e: unknown) {
        if (isAbort(e, controller.signal)) return; // ignore dev-mode aborts/cancels
        setErr(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort("effect cleanup");
  }, []);

  return (
    <Card className="h-[34rem]">
      <CardHeader>
        <CardTitle>Overall Compliance (Yearly Trend)</CardTitle>
        {/* Show error only if we have no data */}
        {err && !data.length && <span className="text-xs text-red-600">Error: {err}</span>}
      </CardHeader>

      <CardContent className="h-[calc(100%-4rem)]">
        {loading ? (
          <div className="h-full grid place-items-center text-gray-600 text-sm">Loading…</div>
        ) : !data.length || !frameworkKeys.length ? (
          <div className="h-full grid place-items-center text-gray-500 text-sm">
            No data yet. Complete assessments to build history.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 36, right: 16, bottom: 8, left: 0 }}>
              <defs>
                {frameworkKeys.map((key, i) => {
                  const base = PALETTE[i % PALETTE.length];
                  return (
                    <linearGradient id={`grad-${key}`} key={key} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={base} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={base} stopOpacity={0.04} />
                    </linearGradient>
                  );
                })}
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="center"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ top: 0, lineHeight: "20px", fontSize: 12 }}
              />

              {frameworkKeys.map((key, i) => {
                const color = PALETTE[i % PALETTE.length];
                return (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={key.replace(/_/g, " ")}
                    stroke={color}
                    strokeWidth={2.5}
                    fill={`url(#grad-${key})`}
                    dot={false}
                    activeDot={false}
                    isAnimationActive
                    connectNulls={false} // show gaps for years with no data
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
