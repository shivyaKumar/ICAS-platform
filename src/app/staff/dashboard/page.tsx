"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import FijiNewsSlider from "@/components/ui/FijiNewsSlider";
import FijiCyberNewsSlider from "@/components/ui/FijiCyberNewsSlider";
import Lottie from "lottie-react";
import circlesAnimation from "@/../public/animations/Active.json";
import CompletedAnimation from "@/../public/animations/Completed.json";

const TaskPie = dynamic(() => import("@/components/ui/TaskPie"), { ssr: false });

/* ---------- TYPES ---------- */
type Totals = { completed: number; pending: number; notCompleted: number };
type MyStats = { assignedTasks: number; changesRequested: number; activeAssessments: number; branchName: string; branchTotals: Totals };

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
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {[
          { 
            title: "Active Assessments", 
            value: String(stats?.activeAssessments ?? 0), 
            subtitle: "Ongoing in your branch" 
          },
          { 
            title: "Completed", 
            value: String(completedCount), 
            subtitle: "Assessments closed" 
          },
        ].map((m) => {
          const theme =
            m.title === "Active Assessments"
              ? {
                  cardBg: "bg-gradient-to-br from-gray-900/10 via-amber-50 to-white",
                  barGradient: "bg-gradient-to-r from-gray-900 via-amber-600 to-yellow-500",
                  haloPrimary: "bg-gradient-to-br from-gray-900/15 via-amber-400/20 to-yellow-400/30 blur-xl",
                  haloSecondary: "bg-gradient-to-br from-amber-300/15 via-yellow-300/15 to-orange-200/25 blur-2xl",
                  valueGradient: "bg-gradient-to-r from-gray-900 via-amber-700 to-yellow-600 bg-clip-text text-transparent",
                  subtitle: "text-amber-700/80",
                }
              : {
                  cardBg: "bg-gradient-to-br from-gray-900/10 via-zinc-50 to-amber-50",
                  barGradient: "bg-gradient-to-r from-gray-900 via-yellow-600 to-lime-400",
                  haloPrimary: "bg-gradient-to-br from-gray-900/15 via-yellow-400/20 to-lime-400/30 blur-xl",
                  haloSecondary: "bg-gradient-to-br from-lime-300/15 via-yellow-200/15 to-emerald-200/20 blur-2xl",
                  valueGradient: "bg-gradient-to-r from-gray-900 via-yellow-700 to-lime-600 bg-clip-text text-transparent",
                  subtitle: "text-emerald-700/80",
                };
          return (
            <Card
              key={m.title}
              className={`relative overflow-hidden rounded-3xl border border-gray-900/15 shadow-[0_25px_60px_-30px_rgba(17,24,39,0.65)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-35px_rgba(17,24,39,0.7)] cursor-pointer ${theme.cardBg}`}
            >
              <span className={`absolute inset-x-6 top-0 h-1 rounded-full ${theme.barGradient}`} />
              <div className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full ${theme.haloPrimary}`} />
              <div className={`pointer-events-none absolute -bottom-6 -left-10 h-32 w-32 rounded-full ${theme.haloSecondary}`} />
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
        })}
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
            <Card className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-gray-900/15 bg-gradient-to-br from-gray-900/10 via-amber-50 to-white shadow-[0_25px_60px_-30px_rgba(17,24,39,0.65)] p-6">
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gray-900 via-amber-600 to-yellow-500" />
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-gray-900/20 via-amber-400/20 to-yellow-400/30 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-br from-yellow-300/20 via-amber-200/20 to-gray-900/15 blur-2xl" />
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900">
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
