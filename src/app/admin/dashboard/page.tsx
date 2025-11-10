"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FijiNewsSlider from "@/components/ui/FijiNewsSlider";
import FijiCyberNewsSlider from "@/components/ui/FijiCyberNewsSlider";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { useDashboardData } from "@/hooks/useDashboardData";

const TaskPie = dynamic(() => import("@/components/ui/TaskPie"), { ssr: false });
const RadialProgress = dynamic(() => import("@/components/ui/RadialProgress"), { ssr: false });

// NEW: Compliance components (client-only)
const FrameworkChart = dynamic(() => import("@/components/compliance/FrameworkChart"), { ssr: false });
const DivisionChart = dynamic(() => import("@/components/compliance/DivisionChart"), { ssr: false });
const BranchStackedChart = dynamic(() => import("@/components/compliance/BranchStackedChart"), { ssr: false });
const TrendChart = dynamic(() => import("@/components/compliance/TrendChart"), { ssr: false });
// Removed unused SummaryCards & DashboardHeader (can reintroduce later if needed)

/* ---------------- TYPES ---------------- */
type Totals = { completed: number; pending: number; notCompleted: number };

// Hierarchical progress payload shape used by the division/branch progress section
type DivisionHierarchyResponse = {
  overallActiveAssessments: number;
  divisions: Array<{
    divisionId: string;
    divisionName: string;
    totals: Totals;
    completionPercent: number;
    activeAssessments: number;
    branches: Array<{
      branchId: string;
      branchName: string;
      totals: Totals;
      completionPercent: number;
      activeAssessments: number;
      frameworks: Array<{ name: string; totals: Totals; compliancePercent: number }>;
    }>;
  }>;
};

// Removed unused legacy types (ComplianceItem, BranchRow)

/* ---------------- COMPONENT ---------------- */
export default function AdminDashboardPage() {
  const [hier, setHier] = useState<DivisionHierarchyResponse | null>(null);
  const [hierErr, setHierErr] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  // Removed showComplianceMenu state; charts are always displayed when a framework is selected

  // --- Compliance / Framework hook ---
  const {
    overallCompliancePercent,
    loading: compLoading,
    error: compError,
    byDivision,
    byFramework,
    byBranch,
    trend,
    framework,
    setFramework,
    frameworkOptions,
    setSelectedDivisionId,
    // year, setYear, selectedDivisionId, activeAssessments,
    // completedAssessments, nonCompliantControls removed from destructure (unused in this layout)
  } = useDashboardData(false);

  useEffect(() => {
    if (!framework && byFramework.length > 0) {
      setFramework(byFramework[0].name);
    }
  }, [framework, byFramework, setFramework]);

  /* ---- User Name ---- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include", cache: "no-store" });
        if (!res.ok) return;
        const me = await res.json();
        const name = [me.firstName, me.lastName].filter(Boolean).join(" ").trim() || me.email;
        if (!cancelled) setUserName(name);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---- Load hierarchy & completed ---- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/assessments/progress/by-division-hier", {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload: DivisionHierarchyResponse = await res.json();
        if (!cancelled) setHier(payload);
      } catch (e) {
        if (!cancelled)
          setHierErr(e instanceof Error ? e.message : "Failed to load hierarchical progress");
      }
    })();

    (async () => {
      try {
        const res = await fetch("/api/assessments/completed", {
          cache: "no-store",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setCompletedCount(Array.isArray(data) ? data.length : 0);
        } else if (!cancelled) setCompletedCount(0);
      } catch {
        if (!cancelled) setCompletedCount(0);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---- Compliance table helpers (legacy preview) ---- */
  // (Removed legacy breakdown helpers that were unused or conflicting with new layout)

  /* ---- Metrics & Pie logic ---- */
  const metricThemes: Record<
    string,
    {
      cardBg: string;
      barGradient: string;
      haloPrimary: string;
      haloSecondary: string;
      valueGradient: string;
      subtitle: string;
      dot: string;
    }
  > = {
    "Active Assessments": {
      cardBg: "bg-gradient-to-br from-sky-50 via-white to-indigo-50",
      barGradient: "bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500",
      haloPrimary: "bg-gradient-to-br from-sky-500/15 via-indigo-500/15 to-purple-500/25 blur-xl",
      haloSecondary: "bg-gradient-to-br from-cyan-400/15 via-indigo-400/15 to-purple-400/15 blur-2xl",
      valueGradient: "bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent",
      subtitle: "text-slate-500",
      dot: "bg-gradient-to-r from-sky-400 to-indigo-500 shadow-[0_0_12px_2px_rgba(59,130,246,0.25)]",
    },
    Completed: {
      cardBg: "bg-gradient-to-br from-emerald-50 via-white to-sky-50",
      barGradient: "bg-gradient-to-r from-emerald-400 via-sky-500 to-blue-500",
      haloPrimary: "bg-gradient-to-br from-emerald-500/15 via-sky-500/15 to-blue-500/25 blur-xl",
      haloSecondary: "bg-gradient-to-br from-teal-400/15 via-sky-400/15 to-blue-400/15 blur-2xl",
      valueGradient: "bg-gradient-to-r from-emerald-500 via-sky-500 to-blue-600 bg-clip-text text-transparent",
      subtitle: "text-slate-500",
      dot: "bg-gradient-to-r from-emerald-400 to-sky-500 shadow-[0_0_12px_2px_rgba(16,185,129,0.25)]",
    },
  };
  const defaultMetricTheme = {
    cardBg: "bg-gradient-to-br from-white via-slate-50 to-indigo-50",
    barGradient: "bg-gradient-to-r from-slate-400 via-indigo-500 to-purple-500",
    haloPrimary: "bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-sky-500/20 blur-xl",
    haloSecondary: "bg-gradient-to-br from-indigo-400/10 via-purple-400/10 to-sky-400/10 blur-2xl",
    valueGradient: "bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 bg-clip-text text-transparent",
    subtitle: "text-slate-500",
    dot: "bg-gradient-to-r from-indigo-400 to-purple-500 shadow-[0_0_12px_2px_rgba(99,102,241,0.25)]",
  };

  const metrics = useMemo(
    () => [
      {
        title: "Active Assessments",
        value: String(hier?.overallActiveAssessments ?? 0),
        subtitle: "Ongoing across divisions",
      },
      { title: "Completed", value: String(completedCount), subtitle: "Assessments closed" },
    ],
    [hier?.overallActiveAssessments, completedCount]
  );

  const renderBranchPies = (
    branch: DivisionHierarchyResponse["divisions"][number]["branches"][number]
  ) => {
    const fws = branch.frameworks ?? [];
    if (fws.length >= 2) {
      const iso = fws.find((f) => f.name.toUpperCase().startsWith("ISO")) ?? fws[0];
      const gdpr = fws.find((f) => f.name.toUpperCase().includes("GDPR")) ?? fws[1] ?? fws[0];
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TaskPie label={`${branch.branchName} · ${iso.name}`} {...iso.totals} />
          <TaskPie label={`${branch.branchName} · ${gdpr.name}`} {...gdpr.totals} />
        </div>
      );
    }
    if (fws.length === 1) {
      const fw = fws[0];
      return <TaskPie label={`${branch.branchName} · ${fw.name}`} {...fw.totals} />;
    }
    return <TaskPie label={branch.branchName} {...branch.totals} />;
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="flex flex-col space-y-8 min-h-full overflow-auto px-3 sm:px-4 md:px-6 py-4 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300">
      {/* YOUR WELCOME CARD */}
      <WelcomeBanner name={userName} />

      {/* YOUR NEWS SECTION */}
      <section className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Latest News & Updates</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FijiNewsSlider />
          <FijiCyberNewsSlider />
        </div>
      </section>

      {/* ---- TOP METRICS ---- */}
      <section className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {metrics.map((m) => {
          const theme = metricThemes[m.title] ?? defaultMetricTheme;
          const href =
            m.title === "Active Assessments"
              ? "/admin/assessments/current"
              : m.title === "Completed"
              ? "/admin/assessments/completed"
              : undefined;
        const card = (
            <Card
              key={m.title}
              className={`relative overflow-hidden rounded-3xl border border-white/70 shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer ${theme.cardBg}`}
            >
              <span className={`absolute inset-x-6 top-0 h-1 rounded-full ${theme.barGradient}`} />
              <div className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full ${theme.haloPrimary}`} />
              <div className={`pointer-events-none absolute -bottom-6 -left-10 h-32 w-32 rounded-full ${theme.haloSecondary}`} />
              <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-1">
                <CardTitle className="text-gray-800 text-sm font-semibold uppercase tracking-wide">{m.title}</CardTitle>
                <div className="rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-white/50 backdrop-blur-sm">
                  <span className={`block h-2.5 w-2.5 rounded-full ${theme.dot}`} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10 pt-1">
                <div className={`text-4xl md:text-[2.75rem] font-black leading-none ${theme.valueGradient}`}>{m.value}</div>
                {m.subtitle && <p className={`mt-2 text-xs md:text-sm ${theme.subtitle}`}>{m.subtitle}</p>}
              </CardContent>
            </Card>
          );
          return href ? (
            <Link key={m.title} href={href}>
              {card}
            </Link>
          ) : (
            card
          );
        })}
      </section>

      {/* ---- DIVISION / BRANCH PROGRESS ---- */}
      <section className="pt-2">
        <h2 className="text-lg md:text-xl justify-center font-bold text-gray-900 mb-4">
          Division & Branch Progress
        </h2>
        {hierErr && <div className="text-sm text-red-600">{hierErr}</div>}
        {!hierErr && !hier?.divisions?.length && <div className="text-sm text-gray-600">No divisions found</div>}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
          {hier?.divisions?.map((d) => (
            <div key={d.divisionId} className="w-full space-y-3">
              <button
                onClick={() => setExpanded(expanded === d.divisionId ? null : d.divisionId)}
                className="group relative w-full overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-white via-slate-50 to-indigo-50 p-4 text-left shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
              >
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-400 via-sky-400 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-indigo-400/15 via-sky-400/15 to-purple-400/25 blur-xl" />
                <div className="pointer-events-none absolute -bottom-6 -left-8 h-24 w-24 rounded-full bg-gradient-to-br from-sky-400/15 via-emerald-400/15 to-indigo-400/20 blur-2xl" />
                <RadialProgress label={d.divisionName} percent={d.completionPercent ?? 0} size={140} />
                <span className="mt-3 block text-center text-xs font-medium text-gray-500 transition-colors group-hover:text-indigo-600">
                  {expanded === d.divisionId ? "Hide branch details" : "View branch details"}
                </span>
              </button>
              {expanded === d.divisionId && (
                <div className="grid gap-3">
                  {d.branches.map((b) => (
                    <div
                      key={b.branchId}
                      className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-gradient-to-br from-white via-slate-50 to-sky-50 p-4 shadow-inner shadow-slate-200/60"
                    >
                      {renderBranchPies(b)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

          {/* ---- COMPLIANCE PREVIEW (legacy table; optional to keep) ---- */}
          <section className="pt-2">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">Compliance Preview</h2>
              {compError && <div className="text-sm text-red-600">{String(compError)}</div>}
              <div className="w-full">
                  <Card className="relative w-full overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white via-slate-50 to-emerald-50 shadow-xl">
                      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500" />
                      <div className="pointer-events-none absolute -right-12 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/15 via-sky-400/20 to-indigo-400/25 blur-2xl" />
                      <div className="pointer-events-none absolute -bottom-12 -left-10 h-28 w-28 rounded-full bg-gradient-to-br from-indigo-400/15 via-emerald-400/15 to-sky-400/20 blur-2xl" />
                      <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-semibold text-gray-800">Overall Compliance</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <div className="flex items-center justify-between gap-2">
                              <div className="text-3xl font-extrabold text-gray-900">
                                  {Number.isFinite(overallCompliancePercent)
                                      ? `${Math.round(overallCompliancePercent)}%`
                                      : "—"}
                              </div>
                              <div className="flex items-center gap-2">
                                  <label className="text-xs text-gray-600">Framework:</label>
                                  <select
                                      className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
                                      value={framework ?? ""}
                                      onChange={(e) => setFramework(e.target.value || undefined)}
                                  >
                                      {frameworkOptions.length === 0 && <option value="">(none)</option>}
                                      {frameworkOptions.map((n) => (
                                          <option key={n} value={n}>
                                              {n}
                                          </option>
                                      ))}
                                  </select>
                              </div>
                          </div>

              {compLoading && <div className="text-xs text-gray-500 mt-1">Loading…</div>}

              {/* Embedded analytics charts */}
              {framework && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FrameworkChart
                  data={byFramework}
                  onSelect={(name) => {
                  setFramework(name);
                  setSelectedDivisionId(undefined);
                  }}
                />
                <DivisionChart
                  data={byDivision}
                  onSelect={(id) => setSelectedDivisionId(id)}
                />
                </div>
                <div className="mt-2">
                <BranchStackedChart data={byBranch} />
                </div>
                <div className="mt-2">
                <TrendChart data={trend.map(t => ({ month: t.month, compliancePercent: t.compliancePercent }))} />
                </div>
              </div>
              )}
                      </CardContent>
                  </Card>
              </div>
          </section>

    </div>
  );
}