"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FijiNewsSlider from "@/components/ui/FijiNewsSlider";
import FijiCyberNewsSlider from "@/components/ui/FijiCyberNewsSlider";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { useDashboardData } from "@/hooks/useDashboardData";
import Lottie from "lottie-react";
import circlesAnimation from "@/../public/animations/Active.json";
import CompletedAnimation from "@/../public/animations/Completed.json";

const TaskPie = dynamic(() => import("@/components/ui/TaskPie"), { ssr: false });
const RadialProgress = dynamic(() => import("@/components/ui/RadialProgress"), { ssr: false });

/* ---------------- TYPES ---------------- */
type Totals = { completed: number; pending: number; notCompleted: number };

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
      frameworks: Array<{ name: string; totals: Totals; completionPercent: number }>;
    }>;
  }>;
};

type ComplianceItem = {
  id?: string | number;
  name: string;
  compliancePercent: number;
  yes: number;
  partially: number;
  no: number;
};

type BranchRow = { id: string; name: string; pct?: number };

/* ---------------- COMPONENT ---------------- */
export default function AdminDashboardPage() {
  const [hier, setHier] = useState<DivisionHierarchyResponse | null>(null);
  const [hierErr, setHierErr] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  // --- Compliance / Framework hook ---
  const {
    overallCompliancePercent,
    //nonCompliantControls,
    loading: compLoading,
    error: compError,
    byDivision,
    byFramework,
    framework,
    setFramework,
    frameworkOptions,
    year,
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

  /* ---- Compliance table helpers ---- */
  const [showComplianceMenu, setShowComplianceMenu] = useState(false);
  const [expandedDivisions, setExpandedDivisions] = useState<Record<string, boolean>>({});
  const [branchRowsByDivision, setBranchRowsByDivision] = useState<Record<string, BranchRow[]>>({});
  const [loadingDivisions, setLoadingDivisions] = useState<Record<string, boolean>>({});
  const [loadErrorDivisions, setLoadErrorDivisions] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    setExpandedDivisions({});
    setBranchRowsByDivision({});
    setLoadingDivisions({});
    setLoadErrorDivisions({});
  }, [framework, year]);

  const formatPct = (v?: number) => (Number.isFinite(v) ? `${Math.round(v!)}%` : "—");

  async function fetchBranchCompliance(divisionId: string, fw?: string, y?: string) {
    const qs = new URLSearchParams({ divisionId });
    if (fw) qs.set("framework", fw);
    if (y) qs.set("year", y);
    const res = await fetch(`/api/assessments/progress/compliance/by-branch?${qs.toString()}`, {
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: ComplianceItem[] = await res.json();
    return Array.isArray(data) ? data : [];
  }

  async function ensureDivisionBranchRows(divId: string) {
    if (branchRowsByDivision[divId]) return;
    if (!framework) {
      setLoadErrorDivisions((s) => ({ ...s, [divId]: "Select a framework first." }));
      return;
    }
    setLoadingDivisions((s) => ({ ...s, [divId]: true }));
    setLoadErrorDivisions((s) => ({ ...s, [divId]: undefined }));
    try {
      const arr = await fetchBranchCompliance(divId, framework, year);
      const rows: BranchRow[] = arr
        .map((it) => ({ id: String(it.id ?? it.name), name: it.name, pct: it.compliancePercent }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setBranchRowsByDivision((s) => ({ ...s, [divId]: rows }));
    } catch (e) {
      setLoadErrorDivisions((s) => ({
        ...s,
        [divId]: e instanceof Error ? e.message : "Failed to load branch compliance",
      }));
    } finally {
      setLoadingDivisions((s) => ({ ...s, [divId]: false }));
    }
  }

  function toggleDivisionRow(divId: string) {
    setExpandedDivisions((s) => {
      const next = !s[divId];
      if (next) void ensureDivisionBranchRows(divId);
      return { ...s, [divId]: next };
    });
  }

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
      cardBg: "bg-gradient-to-br from-gray-900/10 via-amber-50 to-white",
      barGradient: "bg-gradient-to-r from-gray-900 via-amber-600 to-yellow-500",
      haloPrimary: "bg-gradient-to-br from-gray-900/15 via-amber-400/20 to-yellow-400/30 blur-xl",
      haloSecondary: "bg-gradient-to-br from-amber-300/15 via-yellow-300/15 to-orange-200/25 blur-2xl",
      valueGradient: "bg-gradient-to-r from-gray-900 via-amber-700 to-yellow-600 bg-clip-text text-transparent",
      subtitle: "text-amber-700/80",
      dot: "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_12px_2px_rgba(245,158,11,0.3)]",
    },
    Completed: {
      cardBg: "bg-gradient-to-br from-gray-900/10 via-zinc-50 to-amber-50",
      barGradient: "bg-gradient-to-r from-gray-900 via-yellow-600 to-lime-400",
      haloPrimary: "bg-gradient-to-br from-gray-900/15 via-yellow-400/20 to-lime-400/30 blur-xl",
      haloSecondary: "bg-gradient-to-br from-lime-300/15 via-yellow-200/15 to-emerald-200/20 blur-2xl",
      valueGradient: "bg-gradient-to-r from-gray-900 via-yellow-700 to-lime-600 bg-clip-text text-transparent",
      subtitle: "text-emerald-700/80",
      dot: "bg-gradient-to-r from-emerald-400 to-lime-300 shadow-[0_0_12px_2px_rgba(16,185,129,0.3)]",
    },
  };
  const defaultMetricTheme = {
    cardBg: "bg-gradient-to-br from-gray-900/10 via-gray-50 to-stone-50",
    barGradient: "bg-gradient-to-r from-gray-900 via-amber-500 to-yellow-500",
    haloPrimary: "bg-gradient-to-br from-gray-900/15 via-amber-400/15 to-yellow-400/25 blur-xl",
    haloSecondary: "bg-gradient-to-br from-gray-900/10 via-amber-300/15 to-yellow-200/20 blur-2xl",
    valueGradient: "bg-gradient-to-r from-gray-900 via-amber-700 to-yellow-600 bg-clip-text text-transparent",
    subtitle: "text-slate-600",
    dot: "bg-gradient-to-r from-gray-900 to-amber-500 shadow-[0_0_12px_2px_rgba(17,24,39,0.25)]",
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
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
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

              {/* ---- (Active vs Completed) ---- */}
              <div
                className={`absolute inset-y-0 right-0 ${
                  m.title === "Completed" ? "w-[35%]" : "w-[45%]"
                } pointer-events-none opacity-90 flex items-center justify-center`}
              >
                <Lottie
                  animationData={m.title === "Completed" ? CompletedAnimation : circlesAnimation}
                  loop
                  autoplay
                  style={{
                    width: m.title === "Completed" ? "65%" : "80%",
                    height: m.title === "Completed" ? "65%" : "80%",
                    transform: m.title === "Completed" ? "scale(0.9)" : "scale(1.2)",
                    filter: "brightness(1.1) saturate(1.2)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-l from-white/60 via-transparent to-transparent" />
              </div>

              <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-1">
                <CardTitle className="text-gray-800 text-sm font-semibold uppercase tracking-wide">{m.title}</CardTitle>
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
                className="group relative w-full overflow-hidden rounded-2xl border border-gray-900/15 bg-gradient-to-br from-gray-900/10 via-amber-50 to-white p-4 text-left shadow-[0_20px_50px_-25px_rgba(17,24,39,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_25px_60px_-30px_rgba(17,24,39,0.65)]"
              >
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gray-900 via-amber-600 to-yellow-500 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-gray-900/15 via-amber-400/20 to-yellow-400/30 blur-xl" />
                <div className="pointer-events-none absolute -bottom-6 -left-8 h-24 w-24 rounded-full bg-gradient-to-br from-amber-300/15 via-stone-200/20 to-gray-900/10 blur-2xl" />
                <RadialProgress label={d.divisionName} percent={d.completionPercent ?? 0} size={140} />
                <span className="mt-3 block text-center text-xs font-medium text-gray-600 transition-colors group-hover:text-amber-600">
                  {expanded === d.divisionId ? "Hide branch details" : "View branch details"}
                </span>
              </button>
              {expanded === d.divisionId && (
                <div className="grid gap-3">
                  {d.branches.map((b) => (
                    <div
                      key={b.branchId}
                      className="flex flex-col gap-3 rounded-2xl border border-gray-900/10 bg-gradient-to-br from-white via-amber-50 to-stone-50 p-4 shadow-inner"
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

      {/* ---- COMPLIANCE PREVIEW ---- */}
      <section className="pt-2">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">Compliance Preview</h2>
        {compError && <div className="text-sm text-red-600">{String(compError)}</div>}
        <div className="w-full">
          <Card className="relative w-full overflow-hidden rounded-3xl border border-gray-900/15 bg-gradient-to-br from-gray-900/10 via-amber-50 to-white shadow-[0_25px_60px_-30px_rgba(17,24,39,0.7)]">
            <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gray-900 via-amber-600 to-yellow-500" />
            <div className="pointer-events-none absolute -right-12 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-gray-900/20 via-amber-400/20 to-yellow-400/30 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-10 h-28 w-28 rounded-full bg-gradient-to-br from-yellow-300/20 via-amber-200/20 to-gray-900/10 blur-2xl" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-900">Overall Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2">
                <div className="text-3xl font-black bg-gradient-to-r from-gray-900 via-amber-700 to-yellow-500 bg-clip-text text-transparent">
                  {Number.isFinite(overallCompliancePercent)
                    ? `${Math.round(overallCompliancePercent)}%`
                    : "—"}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-700">Framework:</label>
                  <select
                    className="text-xs border border-gray-900/20 rounded px-2 py-1 bg-white/80 backdrop-blur focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
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
                  <button
                    className="text-xs px-2 py-1 rounded border border-gray-900/20 bg-gray-900/5 text-gray-900 transition hover:bg-amber-50"
                    onClick={() => setShowComplianceMenu((v) => !v)}
                  >
                    {showComplianceMenu ? "Hide breakdown" : "Show breakdown"}
                  </button>
                </div>
              </div>

              {compLoading && <div className="text-xs text-gray-500 mt-1">Loading…</div>}

              {showComplianceMenu && (
                <div className="mt-3 border-t border-gray-100 pt-3 space-y-3">
                  {!framework && (
                    <div className="text-xs text-gray-500">
                      Select a framework to see division and branch compliance.
                    </div>
                  )}
                  {framework && (!byDivision || byDivision.length === 0) && (
                    <div className="text-xs text-gray-500">No divisions available.</div>
                  )}
                  {framework && byDivision && byDivision.length > 0 && (
                    <ul className="divide-y divide-gray-100">
                      {byDivision.map((d) => {
                        const id = String(d.id ?? d.name);
                        const isOpen = !!expandedDivisions[id];
                        const isLoading = !!loadingDivisions[id];
                        const err = loadErrorDivisions[id];
                        const rows = branchRowsByDivision[id] ?? [];
                        return (
                          <li
                            key={id}
                            className="rounded-xl border border-gray-900/10 bg-gradient-to-br from-white via-amber-50 to-stone-50 p-3 shadow-sm"
                          >
                            <div className="flex items-center justify-between gap-3 text-gray-800">
                              <button className="text-left flex-1" onClick={() => toggleDivisionRow(id)}>
                                <div className="font-medium text-gray-800">{d.name}</div>
                                <div className="text-xs text-gray-600">Weighted: {formatPct(d.compliancePercent)}</div>
                              </button>
                              <button
                                className="text-xs px-3 py-1 rounded-full border border-gray-900/15 bg-gray-900/5 text-gray-900 transition hover:bg-amber-50"
                                onClick={() => toggleDivisionRow(id)}
                              >
                                {isOpen ? "Collapse" : "Expand"}
                              </button>
                            </div>
                            {isOpen && (
                              <div className="mt-3 space-y-2 rounded-xl border border-gray-900/10 bg-gradient-to-br from-white via-amber-50 to-stone-50 p-3 shadow-inner">
                                {isLoading && <div className="text-xs text-gray-500">Loading branches…</div>}
                                {err && <div className="text-xs text-red-600">{err}</div>}
                                {!isLoading && !err && rows.length === 0 && (
                                  <div className="text-xs text-gray-500">No branches found.</div>
                                )}
                                {!isLoading && !err && rows.length > 0 && (
                                  <div className="overflow-hidden rounded-lg border border-gray-100">
                                    <table className="min-w-full text-xs">
                                      <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                          <th className="px-3 py-2 text-left font-semibold">Branch</th>
                                          <th className="px-3 py-2 text-right font-semibold">{framework}</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {rows.map((r) => (
                                          <tr key={r.id} className="bg-white">
                                            <td className="px-3 py-2">{r.name}</td>
                                            <td className="px-3 py-2 text-right">{formatPct(r.pct)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
