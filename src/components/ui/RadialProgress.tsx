'use client';

import { Card } from '@/components/ui/card';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip);

type Props = { label: string; percent: number; size?: number };

export default function RadialProgress({ label, percent, size = 180 }: Props) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  const data = {
    labels: ['Complete', 'Remaining'],
    datasets: [
      {
        data: [p, 100 - p],
        backgroundColor: ['#16a34a', '#e5e7eb'],
        borderWidth: 0,
        cutout: '70%'
      } as any
    ]
  };
  return (
    <Card className="p-4 flex flex-col items-center justify-center">
      <div className="text-sm font-medium mb-2">{label}</div>
      <div style={{ width: size, height: size, position: 'relative' }}>
        <Doughnut data={data} options={{ plugins: { legend: { display: false } } }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xl font-bold">{p}%</div>
        </div>
      </div>
    </Card>
  );
}
