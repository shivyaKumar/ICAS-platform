'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend as ChartLegend,
  ChartData,
  TooltipItem,
  ChartOptions,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, ChartLegend);

type TaskPieProps = {
  label: string;
  completed: number;     // Approved
  pending: number;       // In Progress
  notCompleted: number;  // Rejected
  size?: number;         // chart diameter
};

export default function TaskPie({
  label,
  completed,
  pending,
  notCompleted,
  size = 180,
}: TaskPieProps) {
  // Labels and colors (order must match dataset)
  const LABELS = ['Approved', 'In Progress', 'Rejected'] as const;
  const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // green, amber, red (colorblind-friendly)

  const values = useMemo(
    () => [completed, pending, notCompleted].map((v) => Math.max(0, Number(v) || 0)),
    [completed, pending, notCompleted]
  );
  const total = useMemo(() => values.reduce((a, b) => a + b, 0), [values]);
  const percents = useMemo(
    () => values.map((v) => (total > 0 ? Math.round((v / total) * 100) : 0)),
    [values, total]
  );

  const data: ChartData<'pie', number[], string> = useMemo(
    () => ({
      labels: LABELS as unknown as string[],
      datasets: [
        {
          label: 'Count',
          data: values,
          backgroundColor: COLORS,
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    }),
    [values]
  );

  const options: ChartOptions<'pie'> = useMemo(
    () => ({
      plugins: {
        // We render a custom legend on the right, so disable Chart.js legend
        legend: { display: false },
        tooltip: {
          callbacks: {
            // Show label, count, and percent on hover
            label: (ctx: TooltipItem<'pie'>) => {
              const val = Number(ctx.parsed) || 0;
              const sum = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
              const pct = sum > 0 ? ((val / sum) * 100).toFixed(1) : '0.0';
              return `${ctx.label}: ${val} (${pct}%)`;
            },
          },
        },
      },
      animation: { duration: 300 },
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 4, bottom: 4 } },
    }),
    []
  );

  return (
    <Card className="p-4">
      <div className="text-sm text-center font-medium mb-2 text-gray-800">{label}</div>

      {/* Responsive row: chart left, legend right; stacks on very narrow widths */}
      <div className="w-full flex flex-col sm:flex-row items-center text-center gap-3 sm:gap-4">
        {/* Pie chart (left) */}
        <div style={{ width: size, height: size }} aria-label={`${label} pie chart`}>
          <Pie data={data} options={options} />
        </div>

        {/* Legend (right) */}
        <ul className="text-xs text-gray-700 space-y-2 sm:min-w-[160px]" role="list" aria-label="Pie chart legend">
          {LABELS.map((name, i) => (
            <li key={name} className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: COLORS[i] }}
                aria-hidden="true"
              />
              <span className="font-medium tabular-nums">{percents[i]}%</span>
              <span className="truncate">{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}