"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

type Item = { id?: string; name: string; yes?: number; partially?: number; no?: number; compliancePercent?: number | null };

type SeriesWeighted = { name: string; WeightedPct: number; RemainingPct: number };

type SeriesBreakdown = { name: string; YesPct: number; PartiallyPct: number; NoPct: number };

export default function BranchStackedChart({ data }: { data: Item[] }) {
  const rows = Array.isArray(data) ? data : [];
  const hasWeighted = rows.some(r => typeof r.compliancePercent === 'number');

  const fmt = (v: unknown) => `${Math.round(Number(v))}%`;

  if (hasWeighted) {
    // Weighted mode: use backend CompliancePercent per branch
    const series: SeriesWeighted[] = rows.map(r => {
      const cp = Math.max(0, Math.min(100, Math.round(Number(r.compliancePercent ?? 0))));
      return { name: r.name, WeightedPct: cp, RemainingPct: 100 - cp };
    });
    const chartHeight = Math.max(220, 36 * series.length + 48);
    return (
      <Card>
        <CardHeader><CardTitle>Branch Compliance (Weighted)</CardTitle></CardHeader>
        <CardContent style={{ height: chartHeight }}>
          {series.length === 0 ? (
            <div className="text-sm text-blue-500">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} layout="vertical" barCategoryGap={12} barGap={6} margin={{ top: 10, right: 16, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${Math.round(Number(v))}%`} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
                <Tooltip formatter={fmt} />
                <Legend />
                <Bar dataKey="WeightedPct" fill="#16a34a" maxBarSize={18} name="Weighted" />
                <Bar dataKey="RemainingPct" fill="#e5e7eb" maxBarSize={18} name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    );
  }

  // Fallback: breakdown mode (percent per branch from Yes/Partially/No counts)
  const series: SeriesBreakdown[] = rows.map(d => {
    const y = Number(d.yes) || 0;
    const p = Number(d.partially) || 0;
    const n = Number(d.no) || 0;
    const denom = y + p + n;
    const toPct = (v: number) => (denom > 0 ? (v * 100) / denom : 0);
    return {
      name: d.name,
      YesPct: toPct(y),
      PartiallyPct: toPct(p),
      NoPct: toPct(n),
    };
  });
  const chartHeight = Math.max(220, 36 * series.length + 48);

  return (
    <Card>
      <CardHeader><CardTitle>Branch Compliance Breakdown</CardTitle></CardHeader>
      <CardContent style={{ height: chartHeight }}>
        {series.length === 0 ? (
          <div className="text-sm text-blue-500">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} layout="vertical" barCategoryGap={12} barGap={6} margin={{ top: 10, right: 16, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${Math.round(Number(v))}%`} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
              <Tooltip formatter={fmt} />
              <Legend />
              <Bar dataKey="YesPct" fill="#16a34a" maxBarSize={18} name="Yes" />
              <Bar dataKey="PartiallyPct" fill="#f59e0b" maxBarSize={18} name="Partially" />
              <Bar dataKey="NoPct" fill="#ef4444" maxBarSize={18} name="No" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}