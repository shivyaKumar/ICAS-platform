"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

// Support both legacy month-based shape and multi-framework period-based shape
type LegacyItem = { month: number; compliancePercent: number };
type MultiItem = { period: string; compliancePercent: number; framework: string };

function isMulti(items: readonly unknown[]): items is MultiItem[] {
  return items.some((d) => typeof (d as Partial<MultiItem>)?.period === 'string' && typeof (d as Partial<MultiItem>)?.framework === 'string');
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function TrendChart({ data }: { data: LegacyItem[] | MultiItem[] }) {
  const raw = Array.isArray(data) ? data : [];
  const isMultiMode = isMulti(raw);

  // Multi framework mode: dataset per framework, X axis = period strings
  if (isMultiMode) {
    const frameworks = Array.from(new Set((raw as MultiItem[]).map(d => d.framework)));
    const periods = Array.from(new Set((raw as MultiItem[]).map(d => d.period)));
    const chartData = periods.map(p => {
      const row: Record<string, number | string> = { period: p };
      frameworks.forEach(fw => {
        const item = (raw as MultiItem[]).find(d => d.framework === fw && d.period === p);
        row[fw] = item ? Math.round(item.compliancePercent) : 0;
      });
      return row;
    });

    return (
      <Card>
        <CardHeader><CardTitle>Compliance Trend</CardTitle></CardHeader>
        <CardContent className="h-80">
          {chartData.length === 0 ? (
            <div className="text-sm text-gray-500">No trend data</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 12, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: unknown) => `${Math.round(Number(v))}%`} />
                <Legend />
                {frameworks.map((fw, idx) => (
                  <Line key={fw} type="monotone" dataKey={fw} stroke={idx === 0 ? "#3b82f6" : "#16a34a"} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    );
  }

  // Legacy single-series mode (month index)
  const pointsAll = (raw as LegacyItem[]).map(d => ({ name: MONTHS[(d.month-1)%12], value: Math.round(d.compliancePercent) }));
  const firstIdx = pointsAll.findIndex(p => p.value > 0);
  const points = firstIdx > 0 ? pointsAll.slice(firstIdx) : pointsAll;

  return (
    <Card>
      <CardHeader><CardTitle>Compliance Trend</CardTitle></CardHeader>
      <CardContent className="h-72">
        {points.length === 0 ? (
          <div className="text-sm text-gray-500">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: unknown) => `${Math.round(Number(v))}%`} />
              <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}