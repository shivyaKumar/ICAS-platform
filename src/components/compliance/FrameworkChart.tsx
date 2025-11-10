"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useMemo } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

type Item = {
  name: string;
  compliancePercent: number | null;
  yes: number;
  partially: number;
  no: number;
  weightedNumerator?: number;
  weightedDenominator?: number;
  totalControls?: number;
  assessedControls?: number;
  errorMessage?: string;
};

export default function FrameworkChart({ data, onSelect }: { data: Item[]; onSelect?: (name: string) => void }) {
  const labels = data.map(d => d.name);
  const values = data.map(d => Math.round(d.compliancePercent ?? 0));
  const chart = useMemo(() => ({
    labels,
    datasets: [{
      data: values,
      backgroundColor: ['#16a34a','#3b82f6','#eab308','#ef4444','#a855f7','#10b981'],
      borderWidth: 0
    }]
  }), [labels, values]);

  return (
    <Card>
      <CardHeader><CardTitle>Framework Compliance</CardTitle></CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-sm text-gray-500">No data</div>
        ) : (
          <div className="h-64 md:h-72">
            <Doughnut
              data={chart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                onClick: (_, elements) => {
                  if (!onSelect || !elements?.length) return;
                  const idx = (elements[0] as { index: number }).index;
                  onSelect(labels[idx]);
                },
                plugins: {
                  legend: { position: 'bottom', labels: { boxWidth: 10 } },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => {
                        const i = ctx.dataIndex ?? 0;
                        const item = data[i];
                        const pct = values[i] ?? 0;
                        const num = item.weightedNumerator ?? undefined;
                        const den = item.weightedDenominator ?? undefined;
                        return den && num !== undefined
                          ? `${item.name}: ${pct}% (weighted ${num}/${den})`
                          : `${item.name}: ${pct}%`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}