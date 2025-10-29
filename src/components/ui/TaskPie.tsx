'use client';

import { Card } from '@/components/ui/card';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData, TooltipItem } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

type TaskPieProps = {
  label: string;
  completed: number;
  pending: number; // will be shown as Partially Completed
  notCompleted: number;
  size?: number;
};

export default function TaskPie({ label, completed, pending, notCompleted, size = 180 }: TaskPieProps) {
  const total = Math.max(0, completed + pending + notCompleted);

  const data: ChartData<'pie', number[], string> = {
    labels: ['Completed', 'Partially Completed', 'Not Completed'],
    datasets: [
      {
        label: '%',
        data: [completed, pending, notCompleted],
        backgroundColor: ['#16a34a', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <Card className="p-4 flex flex-col items-center justify-center">
      <div className="text-sm font-medium mb-2 text-gray-800">{label}</div>
      <div style={{ width: size, height: size }}>
        <Pie
          data={data}
          options={{
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx: TooltipItem<'pie'>) => {
                    const val = Number(ctx.parsed) || 0;
                    const dataset = ctx.chart.data.datasets[ctx.datasetIndex!];
                    const values = (dataset.data as number[]) ?? [];
                    const sum = values.reduce((a, b) => a + (Number(b) || 0), 0) || 1;
                    const pct = Math.round((val / sum) * 100);
                    const name = ctx.label ?? '';
                    return `${name}: ${pct}%`;
                  },
                },
              },
            },
            animation: { duration: 300 },
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>
    </Card>
  );
}
