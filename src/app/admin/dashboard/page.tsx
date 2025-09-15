"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Recharts (client-only)
const ComplianceCharts = dynamic(() => import("../components/ComplianceCharts"), {
  ssr: false,
  loading: () => (
    <div className="h-64 rounded-xl border bg-white flex items-center justify-center text-sm text-gray-600">
      Loading charts…
    </div>
  ),
});

/* ---------- Types ---------- */
type Division = { name: string; percent: number };
type Framework = { id: string; name: string; percent: number; divisions: Division[] };

export default function AdminDashboardPage() {
  /* ---------- Dynamic frameworks ---------- */
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [fwLoading, setFwLoading] = useState(true);
  const [fwError, setFwError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setFwLoading(true);
        setFwError(null);

        const res = await fetch("/api/frameworks", { cache: "no-store" });

        if (!res.ok) throw new Error(`Failed to load frameworks: ${res.status}`);
        const { frameworks } = (await res.json()) as { frameworks: Framework[] };

        if (!cancelled) setFrameworks(Array.isArray(frameworks) ? frameworks : []);
      } catch (err) {
        if (!cancelled)
          setFwError(err instanceof Error ? err.message : "Failed to load frameworks");
      } finally {
        if (!cancelled) setFwLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- Helpers ---------- */
  const getProgressColor = (percent: number) => {
    if (percent >= 70) return "bg-green-500";
    if (percent >= 40) return "bg-yellow-400";
    return "bg-red-500";
  };

  const metricGradient =
    "bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent";

  /* ---------- Top metrics (removed Overall Compliance) ---------- */
  const topMetrics = [
    { title: "Active Assessments", value: "0", subtitle: "Ongoing across divisions" },
    { title: "Completed", value: "0", subtitle: "Assessments closed" },
    { title: "Pending Reviews", value: "0", subtitle: "Awaiting admin action" },
  ];

  return (
    <div
      className="flex flex-col space-y-8 min-h-full overflow-auto
                 px-3 sm:px-4 md:px-6 py-4
                 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm md:text-base text-gray-700">
          Monitor compliance progress and manage assessments across divisions
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 min-w-0">
        {topMetrics.map((m) => (
          <Card
            key={m.title}
            className="bg-white shadow-md rounded-xl border border-gray-100
                       hover:scale-105 hover:shadow-2xl transition-transform duration-300"
          >
            <CardHeader>
              <CardTitle className="text-gray-800 text-sm md:text-base font-semibold">
                {m.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl md:text-4xl font-extrabold ${metricGradient}`}>
                {m.value}
              </div>
              {m.subtitle && (
                <p className="text-xs md:text-sm text-gray-500">{m.subtitle}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics (overall trend) */}
      <section>
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Analytics</h2>
        <ComplianceCharts />
      </section>

      {/* Framework Compliance */}
      <section>
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Framework Compliance</h2>

        {fwLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-white border animate-pulse" />
            ))}
          </div>
        )}

        {fwError && <p className="text-sm text-red-600">Failed to load data: {fwError}</p>}

        {!fwLoading && !fwError && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 min-w-0">
              {frameworks.map((fw) => (
                <Card
                  key={fw.id}
                  className="bg-white shadow-md rounded-xl border border-gray-100
                             hover:scale-105 hover:shadow-2xl transition-transform duration-300"
                >
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl font-bold">{fw.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl md:text-5xl font-extrabold">
                      {fw.percent ?? 0}%
                    </div>

                    <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
                      <div
                        className={`h-2 ${getProgressColor(fw.percent ?? 0)} rounded-full`}
                        style={{ width: `${fw.percent ?? 0}%` }}
                      />
                    </div>

                    {fw.divisions?.length ? (
                      <div className="mt-4 space-y-1 text-xs md:text-sm">
                        {fw.divisions.map((d) => (
                          <div key={d.name} className="flex justify-between text-gray-700">
                            <span>{d.name}</span>
                            <span className="font-medium">{d.percent}%</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-gray-400 italic">No division data yet</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {frameworks.length === 0 && (
              <p className="text-sm text-gray-500 italic mt-2">
                No frameworks yet. Upload one to see it here automatically.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
