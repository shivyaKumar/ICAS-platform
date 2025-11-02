'use client';

import { Card } from '@/components/ui/card';
import { Chart as ChartJS, ArcElement, Tooltip, Legend as ChartLegend, ChartData, TooltipItem } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, ChartLegend);

type TaskPieProps = {
  label: string;
  completed: number;
  pending: number; // shown as Partially Completed
  notCompleted: number;
  size?: number; // chart diameter
};

export default function TaskPie({ label, completed, pending, notCompleted, size = 180 }: TaskPieProps) {
  // Labels and colors (order must match dataset)
  const labels = ['Completed', 'Partially Completed', 'Not Completed'] as const;
  const COLORS = ['#16a34a', '#f59e0b', '#ef4444'];

  const values = [completed, pending, notCompleted].map((v) => Number(v) || 0);
  const total = values.reduce((a, b) => a + b, 0);
  const percents = values.map((v) => (total > 0 ? Math.round((v / total) * 100) : 0));

  const data: ChartData<'pie', number[], string> = {
    labels: labels as unknown as string[],
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
  };

          return (
    <Card className="p-4">
                  <div className="text-sm text-center font-medium mb-2 text-gray-800">{label}</div>

      {/* Responsive row: chart left, legend right; stacks on very narrow widths */}
      <div className="w-full flex flex-col sm:flex-row items-center text-center gap-3 sm:gap-4">
        {/* Pie chart (left) */}
        <div style={{ width: size, height: size }}>
          <Pie
            data={data}
            options={{
              plugins: {
                // We render a custom legend on the right, so disable Chart.js legend
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    // Show absolute counts on hover
                    label: (ctx: TooltipItem<'pie'>) => {
                      const val = Number(ctx.parsed) || 0;
                      const name = ctx.label ?? '';
                      return `${val} controls: ${name}`;
                    },
                  },
                },
              },
              animation: { duration: 300 },
              responsive: true,
              maintainAspectRatio: false,
              layout: { padding: { top: 4, bottom: 4 } },
            }}
          />
        </div>

        {/* Legend (right) */}
        <ul className="text-xs text-gray-700 space-y-2 sm:min-w-[160px]">
          {labels.map((name, i) => (
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