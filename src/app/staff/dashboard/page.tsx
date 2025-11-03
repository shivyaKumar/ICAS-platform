"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import FijiNewsSlider from "@/components/ui/FijiNewsSlider";
import FijiCyberNewsSlider from "@/components/ui/FijiCyberNewsSlider";

const TaskPie = dynamic(() => import("@/components/ui/TaskPie"), { ssr: false });

type Totals = { completed: number; pending: number; notCompleted: number };
type MyStats = { assignedTasks: number; changesRequested: number; branchName: string; branchTotals: Totals };

export default function StaffDashboardPage() {
  const [stats, setStats] = useState<MyStats | null>(null);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [userName, setUserName] = useState("");
  const [err, setErr] = useState<string | null>(null);

  // Load user name
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
    return () => { cancelled = true; };
  }, []);

  // Load stats and progress
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
    const vis = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", vis);
    return () => { cancelled = true; document.removeEventListener("visibilitychange", vis); };
  }, []);

  const metricGradient = "bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent";

  return (
    <div className="flex flex-col space-y-8 min-h-full overflow-auto px-3 sm:px-4 md:px-6 py-4 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300">

      {/* ðŸ‘‹ Welcome Banner */}
      <WelcomeBanner name={userName} />

      {/* News Section */}
      <section className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Latest News & Updates</h2>
          <a href="/dashboard/news" className="text-sm text-indigo-600 hover:underline">
            View More &rarr;
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FijiNewsSlider />
          <FijiCyberNewsSlider />
        </div>
      </section>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 min-w-0">
        {[ 
          { title: "Assigned Tasks", value: String(stats?.assignedTasks ?? 0), subtitle: "Assigned to you" },
          /*{ title: "Changes Requested", value: String(stats?.changesRequested ?? 0), subtitle: "Returned by admin" },*/
          { title: "Completed", value: String(completedCount), subtitle: "Assessments closed" },
        ].map((m) => (
          <Card
            key={m.title}
            className="relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition"
          >
            <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400" />
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-gray-800 text-sm font-semibold">{m.title}</CardTitle>
              <div className="rounded-full bg-white p-1 shadow-sm ring-1 ring-gray-100">
                <span className="block h-2.5 w-2.5 rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="text-4xl md:text-[2.5rem] font-extrabold leading-none text-gray-900">{m.value}</div>
              {m.subtitle && <p className="mt-2 text-xs md:text-sm text-gray-500">{m.subtitle}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Branch Progress */}
      <section className="pt-2">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">My Branch Progress</h2>
        {err && <div className="text-sm text-red-600">{err}</div>}
        {!err && (!stats || (stats.branchTotals.completed + stats.branchTotals.pending + stats.branchTotals.notCompleted) === 0) && (
          <div className="text-sm text-gray-700 bg-white border rounded-md p-4">
            You have no active assignments in your branch right now.
          </div>
        )}
        {stats && (stats.branchTotals.completed + stats.branchTotals.pending + stats.branchTotals.notCompleted) > 0 && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <TaskPie
              label={`${stats.branchName} Â· Branch`}
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
