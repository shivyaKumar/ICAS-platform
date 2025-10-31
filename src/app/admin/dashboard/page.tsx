"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link"; // ✅ added
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FijiNewsSlider from "@/components/ui/FijiNewsSlider";
import FijiCyberNewsSlider from "@/components/ui/FijiCyberNewsSlider";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner"; // ✅ Added import

const TaskPie = dynamic(() => import("@/components/ui/TaskPie"), { ssr: false });
const RadialProgress = dynamic(() => import("@/components/ui/RadialProgress"), { ssr: false });

type Division = { name: string; percent: number };
type Framework = { id: string; name: string; percent: number; divisions: Division[] };

type FrameworksResponse = { frameworks?: unknown } | unknown[];
function normalizeFrameworks(payload: unknown): Framework[] {
  if (Array.isArray(payload)) return payload as Framework[];
  if (typeof payload === "object" && payload !== null) {
    const maybe = payload as { frameworks?: unknown };
    if (Array.isArray(maybe.frameworks)) return maybe.frameworks as Framework[];
  }
  return [];
}

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

export default function AdminDashboardPage() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [fwLoading, setFwLoading] = useState(true);
  const [fwError, setFwError] = useState<string | null>(null);

  const [hier, setHier] = useState<DivisionHierarchyResponse | null>(null);
  const [hierErr, setHierErr] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  // ✅ Fetch user name for the welcome banner
  const [userName, setUserName] = useState("");

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
        setFwLoading(true);
        const res = await fetch("/api/frameworks", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load frameworks: ${res.status}`);
        const payload: FrameworksResponse = await res.json();
        const list = normalizeFrameworks(payload);
        if (!cancelled) setFrameworks(list);
      } catch (err) {
        if (!cancelled)
          setFwError(err instanceof Error ? err.message : "Failed to load frameworks");
      } finally {
        if (!cancelled) setFwLoading(false);
      }
    })();

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

  return (
    <div className="flex flex-col space-y-8 min-h-full overflow-auto px-3 sm:px-4 md:px-6 py-4 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300">
      {/* Added Welcome Banner */}
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
        {metrics.map((m) => {
          const href =
            m.title === "Active Assessments"
              ? "/admin/assessments/current"
              : m.title === "Completed"
              ? "/admin/assessments/completed"
              : undefined;

          const CardBody = (
            <Card
              key={m.title}
              className="bg-white shadow-md rounded-xl border border-gray-100 hover:scale-[1.03] hover:shadow-xl transition-all duration-300 cursor-pointer"
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
                  <p className="text-xs md:text-sm text-gray-500 mt-1">{m.subtitle}</p>
                )}
              </CardContent>
            </Card>
          );

          return href ? (
            <Link key={m.title} href={href} className="block">
              {CardBody}
            </Link>
          ) : (
            CardBody
          );
        })}
      </section>

      {/* Division + Branch Progress */}
      <section className="pt-2">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
          Division & Branch Progress
        </h2>
        {hierErr && <div className="text-sm text-red-600">{hierErr}</div>}
        {!hierErr && !hier?.divisions?.length && (
          <div className="text-sm text-gray-600">No divisions found</div>
        )}
        <div className="space-y-8">
          {hier?.divisions?.map((d) => (
            <div key={d.divisionId}>
              <button
                onClick={() =>
                  setExpanded(expanded === d.divisionId ? null : d.divisionId)
                }
                className="w-full text-left"
              >
                <RadialProgress
                  label={d.divisionName}
                  percent={d.completionPercent ?? 0}
                />
              </button>
              {expanded === d.divisionId && (
                <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
    </div>
  );
}
