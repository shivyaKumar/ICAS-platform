"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FijiNewsSlider from "@/components/ui/FijiNewsSlider";
import FijiCyberNewsSlider from "@/components/ui/FijiCyberNewsSlider";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { useDashboardData } from "@/hooks/useDashboardData";

const TaskPie = dynamic(() => import("@/components/ui/TaskPie"), { ssr: false });
const RadialProgress = dynamic(() => import("@/components/ui/RadialProgress"), { ssr: false });

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

export default function AdminDashboardPage() {
    const [hier, setHier] = useState<DivisionHierarchyResponse | null>(null);
    const [hierErr, setHierErr] = useState<string | null>(null);
    const [completedCount, setCompletedCount] = useState<number>(0);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [userName, setUserName] = useState("");

    // Compliance preview + filters + lists
    const {
        overallCompliancePercent,
        nonCompliantControls,
        loading: compLoading,
        error: compError,
        byDivision,              // divisions list, filtered by selected framework
        byFramework,             // list of frameworks with compliance percent
        framework, setFramework, // current framework filter
        frameworkOptions,        // names array (derived)
        year,                    // current year filter
    } = useDashboardData(false);

    // Auto-select first framework when list arrives (if not chosen yet)
    useEffect(() => {
        if (!framework && byFramework.length > 0) {
            setFramework(byFramework[0].name);
        }
    }, [framework, byFramework, setFramework]);

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

    const metricGradient =
        "bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent";

    const metrics = useMemo(() => {
        return [
            {
                title: "Active Assessments",
                value: String(hier?.overallActiveAssessments ?? 0),
                subtitle: "Ongoing across divisions",
            },
            { title: "Completed", value: String(completedCount), subtitle: "Assessments closed" },
        ];
    }, [hier?.overallActiveAssessments, completedCount]);

    const renderBranchPies = (
        branch: DivisionHierarchyResponse["divisions"][number]["branches"][number]
    ) => {
        const fws = branch.frameworks ?? [];
        if (fws.length >= 2) {
            const iso = fws.find((f) => f.name.toUpperCase().startsWith("ISO")) ?? fws[0];
            const gdpr =
                fws.find((f) => f.name.toUpperCase().includes("GDPR")) ?? fws[1] ?? fws[0];
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <TaskPie
                        label={`${branch.branchName} · ${iso.name}`}
                        completed={iso.totals.completed}
                        pending={iso.totals.pending}
                        notCompleted={iso.totals.notCompleted}
                    />
                    <TaskPie
                        label={`${branch.branchName} · ${gdpr.name}`}
                        completed={gdpr.totals.completed}
                        pending={gdpr.totals.pending}
                        notCompleted={gdpr.totals.notCompleted}
                    />
                </div>
            );
        }
        if (fws.length === 1) {
            const fw = fws[0];
            return (
                <TaskPie
                    label={`${branch.branchName} · ${fw.name}`}
                    completed={fw.totals.completed}
                    pending={fw.totals.pending}
                    notCompleted={fw.totals.notCompleted}
                />
            );
        }
        return (
            <TaskPie
                label={branch.branchName}
                completed={branch.totals.completed}
                pending={branch.totals.pending}
                notCompleted={branch.totals.notCompleted}
            />
        );
    };

    // --- Compliance dropdown (dynamic framework) ---
    const [showComplianceMenu, setShowComplianceMenu] = useState(false);
    const [expandedDivisions, setExpandedDivisions] = useState<Record<string, boolean>>({});
    const [branchRowsByDivision, setBranchRowsByDivision] = useState<Record<string, BranchRow[]>>({});
    const [loadingDivisions, setLoadingDivisions] = useState<Record<string, boolean>>({});
    const [loadErrorDivisions, setLoadErrorDivisions] = useState<Record<string, string | undefined>>({});

    // Clear cached branch rows when framework changes
    useEffect(() => {
        setExpandedDivisions({});
        setBranchRowsByDivision({});
        setLoadingDivisions({});
        setLoadErrorDivisions({});
    }, [framework, year]);

    const formatPct = (v?: number) =>
        Number.isFinite(v) ? `${Math.round(v!)}%` : "—";

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
        if (branchRowsByDivision[divId]) return; // already loaded
        if (!framework) {
            setLoadErrorDivisions((s) => ({ ...s, [divId]: "Select a framework first." }));
            return;
        }
        setLoadingDivisions((s) => ({ ...s, [divId]: true }));
        setLoadErrorDivisions((s) => ({ ...s, [divId]: undefined }));
        try {
            const arr = await fetchBranchCompliance(divId, framework, year);
            const rows: BranchRow[] = arr.map((it) => ({
                id: String(it.id ?? it.name),
                name: it.name,
                pct: it.compliancePercent,
            })).sort((a, b) => a.name.localeCompare(b.name));
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

    return (
        <div className="flex flex-col space-y-8 min-h-full overflow-auto px-3 sm:px-4 md:px-6 py-4 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300">
            {/* Welcome Banner */}
            <WelcomeBanner name={userName} />

            {/* News Section */}
            <section className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition mb-4">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold text-gray-800">Latest News & Updates</h2>
                    <a href="/dashboard/news" className="text-sm text-indigo-600 hover:underline">
                        View More →
                    </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FijiNewsSlider />
                    <FijiCyberNewsSlider />
                </div>
            </section>

            {/* Top Metrics */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 min-w-0">
                {metrics.map((m) => (
                    <Card
                        key={m.title}
                        className="bg-white shadow-md rounded-xl border border-gray-100 hover:scale-[1.03] hover:shadow-xl transition-all duration-300"
                    >
                        <CardHeader>
                            <CardTitle className="text-gray-800 text-sm md:text-base font-semibold">
                                {m.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-3xl md:text-4xl font-extrabold ${metricGradient}`}
                            >
                                {m.value}
                            </div>
                            {m.subtitle && (
                                <p className="text-xs md:text-sm text-gray-500 mt-1">{m.subtitle}</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </section>

            {/* Division + Branch Progress */}
            <section className="pt-2">
                <h2 className="text-lg md:text-xl justify-center font-bold text-gray-900 mb-4">
                    Division & Branch Progress
                </h2>
                {hierErr && <div className="text-sm text-red-600">{hierErr}</div>}
                {!hierErr && !hier?.divisions?.length && (
                    <div className="text-sm text-gray-600">No divisions found</div>
                )}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
                    {hier?.divisions?.map((d) => (
                        <div key={d.divisionId} className="w-full">
                            <button
                                onClick={() =>
                                    setExpanded(expanded === d.divisionId ? null : d.divisionId)
                                }
                                className="w-full text-left"
                            >
                                <RadialProgress
                                    label={d.divisionName}
                                    percent={d.completionPercent ?? 0}
                                    size={140}
                                />
                            </button>
                            {expanded === d.divisionId && (
                                <div className="mt-3 grid gap-3">
                                    {d.branches.map((b) => (
                                        <div key={b.branchId} className="flex flex-col gap-3">
                                            {renderBranchPies(b)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Compliance Preview + dynamic framework dropdown */}
            <section className="pt-2">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">Compliance Preview</h2>
                {compError && <div className="text-sm text-red-600">{String(compError)}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Overall + dropdown */}
                    <Card className="bg-white shadow-sm border border-gray-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-gray-800">Overall Compliance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between gap-2">
                                <div className="text-2xl font-extrabold text-gray-900">
                                    {Number.isFinite(overallCompliancePercent) ? `${Math.round(overallCompliancePercent)}%` : "—"}
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Framework selector (dynamic) */}
                                    <label className="text-xs text-gray-600">Framework:</label>
                                    <select
                                        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                                        value={framework ?? ""}
                                        onChange={(e) => setFramework(e.target.value || undefined)}
                                    >
                                        {frameworkOptions.length === 0 && <option value="">(none)</option>}
                                        {frameworkOptions.map((name) => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>

                                    <button
                                        className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
                                        onClick={() => setShowComplianceMenu((v) => !v)}
                                    >
                                        {showComplianceMenu ? "Hide breakdown" : "Show breakdown"}
                                    </button>
                                </div>
                            </div>
                            {compLoading && <div className="text-xs text-gray-500 mt-1">Loading…</div>}

                            {/* Dropdown content: divisions list and branches for the selected framework */}
                            {showComplianceMenu && (
                                <div className="mt-3 border-t border-gray-100 pt-3">
                                    {!framework && (
                                        <div className="text-xs text-gray-500">Select a framework to see division and branch compliance.</div>
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
                                                    <li key={id} className="py-2">
                                                        <div className="flex items-center justify-between">
                                                            <button
                                                                className="text-left flex-1"
                                                                onClick={() => toggleDivisionRow(id)}
                                                                title="Toggle branches"
                                                            >
                                                                <div className="font-medium text-gray-800">{d.name}</div>
                                                                <div className="text-xs text-gray-500">Weighted: {formatPct(d.compliancePercent)}</div>
                                                            </button>
                                                            <button
                                                                className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 ml-2"
                                                                onClick={() => toggleDivisionRow(id)}
                                                            >
                                                                {isOpen ? "Collapse" : "Expand"}
                                                            </button>
                                                        </div>

                                                        {/* Branch table: single selected framework */}
                                                        {isOpen && (
                                                            <div className="mt-2">
                                                                {isLoading && <div className="text-xs text-gray-500">Loading branches…</div>}
                                                                {err && <div className="text-xs text-red-600">{err}</div>}
                                                                {!isLoading && !err && rows.length === 0 && (
                                                                    <div className="text-xs text-gray-500">No branches found.</div>
                                                                )}
                                                                {!isLoading && !err && rows.length > 0 && (
                                                                    <div className="rounded border border-gray-100 overflow-hidden">
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

                    {/* Non-Compliant Controls 
                    <Card className="bg-white shadow-sm border border-gray-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-gray-800">Non-Compliant Controls</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold text-gray-900">
                                {Number.isFinite(nonCompliantControls) ? String(nonCompliantControls) : "0"}
                            </div>
                            {compLoading && <div className="text-xs text-gray-500 mt-1">Loading…</div>}
                        </CardContent>
                    </Card*/}
                </div>
            </section>
        </div>
    );
}