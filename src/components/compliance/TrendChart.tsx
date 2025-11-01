"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

type Item = { month: number; compliancePercent: number };

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function TrendChart({ data }: { data: Item[] }) {
  const raw = Array.isArray(data) ? data : [];
  const pointsAll = raw.map(d => ({ name: MONTHS[(d.month-1)%12], value: Math.round(d.compliancePercent) }));
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
