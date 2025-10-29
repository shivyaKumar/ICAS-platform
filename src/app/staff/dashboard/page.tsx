"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TaskPie = dynamic(() => import("@/components/ui/TaskPie"), { ssr: false });

type Totals = { completed: number; pending: number; notCompleted: number };
type MyStats = { assignedTasks: number; changesRequested: number; branchName: string; branchTotals: Totals };

export default function StaffDashboardPage() {
  const [stats, setStats] = useState<MyStats | null>(null);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [sRes, cRes] = await Promise.all([
          fetch("/api/assessments/progress/my-stats", { cache: "no-store", credentials: "include" }),
          fetch("/api/assessments/completed", { cache: "no-store", credentials: "include" }),
        ]);

        if (!sRes.ok) throw new Error(`Stats ${sRes.status}`);
        const sPayload = (await sRes.json()) as MyStats;
        const cPayload = cRes.ok ? await cRes.json() : [];

        if (!cancelled) {
          setStats(sPayload);
          setCompletedCount(Array.isArray(cPayload) ? cPayload.length : 0);
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed to load");
      }
    };

    load();
    const vis = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', vis);
    return () => { cancelled = true; document.removeEventListener('visibilitychange', vis); };
  }, []);

  const metricGradient = "bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent";

  return (
    <div
      className="flex flex-col space-y-8 min-h-full overflow-auto
                 px-3 sm:px-4 md:px-6 py-4
                 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300"
    >
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 min-w-0">
        {[
          { title: "Assigned Tasks", value: String(stats?.assignedTasks ?? 0), subtitle: "Assigned to you" },
          { title: "Changes Requested", value: String(stats?.changesRequested ?? 0), subtitle: "Returned by admin" },
          { title: "Completed", value: String(completedCount), subtitle: "Assessments closed" },
        ].map((m) => (
          <Card
            key={m.title}
            className="bg-white shadow-md rounded-xl border border-gray-100 
                       hover:scale-105 hover:shadow-2xl 
                       transform transition-transform duration-300 ease-in-out"
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

      {/* Branch Progress (pie) */}
      <section className="pt-2">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">My Branch Progress</h2>
        {err && <div className="text-sm text-red-600">{err}</div>}
        {!err && (!stats || (stats.branchTotals.completed + stats.branchTotals.pending + stats.branchTotals.notCompleted) === 0) && (
          <div className="text-sm text-gray-700 bg-white border rounded-md p-4">
            You have no active assignments in your branch right now. When tasks are assigned, this section will show your branch progress across active assessments.
          </div>
        )}
        {stats && (stats.branchTotals.completed + stats.branchTotals.pending + stats.branchTotals.notCompleted) > 0 && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <TaskPie
              label={`${stats.branchName} · Branch`}
              completed={stats.branchTotals.completed}
              pending={stats.branchTotals.pending}
              notCompleted={stats.branchTotals.notCompleted}
            />
          </div>
        )}
      </section>
    </div>
  );
}