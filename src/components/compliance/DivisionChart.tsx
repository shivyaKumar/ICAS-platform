"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

type Item = { id?: string; name: string; compliancePercent: number };

type ClickPayload = { activePayload?: Array<{ payload?: { id?: string } }> };

export default function DivisionChart({ data, onSelect }: { data: Item[]; onSelect?: (id: string) => void }) {
  const rows = Array.isArray(data) ? data : [];
  // Expand height for readability when many divisions
  const height = Math.min(440, Math.max(280, 56 + rows.length * 24));

  return (
    <Card>
      <CardHeader><CardTitle>Division Compliance</CardTitle></CardHeader>
      <CardContent style={{ height }}>
        {rows.length === 0 ? (
          <div className="text-sm text-gray-500">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${Math.round(Number(v))}%`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: unknown) => `${Math.round(Number(v))}%`} />
              <Bar
                dataKey="compliancePercent"
                fill="#3b82f6"
                maxBarSize={40}
                onClick={(d) => {
                  const payload = (d as unknown as ClickPayload)?.activePayload?.[0]?.payload;
                  const id = payload?.id;
                  if (id && onSelect) onSelect(String(id));
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
