"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import FijiNewsSlider from "@/components/ui/FijiNewsSlider";
import FijiCyberNewsSlider from "@/components/ui/FijiCyberNewsSlider";

const TaskPie = dynamic(() => import("@/components/ui/TaskPie"), { ssr: false });

/* ---------- TYPES ---------- */
type Totals = { completed: number; pending: number; notCompleted: number };
type MyStats = { assignedTasks: number; changesRequested: number; branchName: string; branchTotals: Totals };

export default function StaffDashboardPage() {
  const [stats, setStats] = useState<MyStats | null>(null);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [userName, setUserName] = useState("");
  const [err, setErr] = useState<string | null>(null);

  /* ---------- LOAD USER ---------- */
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

  /* ---------- LOAD STATS ---------- */
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

  /* ---------- RENDER ---------- */
  return (
    <div className="flex flex-col space-y-8 min-h-full overflow-auto px-3 sm:px-4 md:px-6 py-4 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300">
      
      {/* Welcome Banner */}
      <WelcomeBanner name={userName} />

      {/*News Section */}
      <section className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Latest News & Updates</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FijiNewsSlider />
          <FijiCyberNewsSlider />
        </div>
      </section>

      {/*Metrics Section */}
      <section className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {[
          { title: "Assigned Tasks", value: String(stats?.assignedTasks ?? 0), subtitle: "Assigned to you" },
          { title: "Completed", value: String(completedCount), subtitle: "Assessments closed" },
        ].map((m) => (
          <Card
            key={m.title}
            className="relative overflow-hidden rounded-3xl border border-white/70 shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer bg-gradient-to-br from-white via-slate-50 to-indigo-50"
          >
            <span className="absolute inset-x-6 top-0 h-1 rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-indigo-400/15 via-sky-400/15 to-emerald-400/25 blur-xl" />
            <div className="pointer-events-none absolute -bottom-6 -left-10 h-32 w-32 rounded-full bg-gradient-to-br from-sky-400/15 via-emerald-400/15 to-indigo-400/20 blur-2xl" />
            <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-gray-800 text-sm font-semibold uppercase tracking-wide">{m.title}</CardTitle>
              <div className="rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-white/50 backdrop-blur-sm">
                <span className="block h-2.5 w-2.5 rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400 shadow-[0_0_12px_2px_rgba(99,102,241,0.25)]" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-1">
              <div className="text-4xl md:text-[2.75rem] font-black leading-none bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
                {m.value}
              </div>
              {m.subtitle && <p className="mt-2 text-xs md:text-sm text-slate-500">{m.subtitle}</p>}
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Branch Progress (Full-width responsive layout) */}
      <section className="pt-2">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 text-center">
          My Branch Progress
        </h2>
        {err && <div className="text-sm text-red-600 text-center">{err}</div>}

        {!err && (!stats || (stats.branchTotals.completed + stats.branchTotals.pending + stats.branchTotals.notCompleted) === 0) && (
          <div className="text-sm text-gray-700 bg-white border rounded-md p-4 text-center">
            You have no active assignments in your branch right now.
          </div>
        )}

        {stats && (stats.branchTotals.completed + stats.branchTotals.pending + stats.branchTotals.notCompleted) > 0 && (
          <div className="flex justify-center">
            <Card className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white via-slate-50 to-sky-50 shadow-xl p-6">
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400" />
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-sky-400/15 via-indigo-400/15 to-purple-400/25 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-400/15 via-sky-400/15 to-emerald-400/20 blur-2xl" />
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-800">
                  {stats.branchName} · Branch Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center">
                <div className="w-full max-w-[500px] mx-auto">
                  <TaskPie
                    label={`${stats.branchName} · Branch`}
                    completed={stats.branchTotals.completed}
                    pending={stats.branchTotals.pending}
                    notCompleted={stats.branchTotals.notCompleted}
                    size={250}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </div>
  );
}
