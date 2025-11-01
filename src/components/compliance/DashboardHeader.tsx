"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  year: string | undefined;
  setYear: (y: string | undefined) => void;
  framework: string | undefined;
  setFramework: (f: string | undefined) => void;
  frameworkOptions: string[];
};

export default function DashboardHeader({ year, setYear, framework, setFramework, frameworkOptions }: Props) {
  const years = Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() - i));
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Year</span>
        <Select onValueChange={(v) => setYear(v)} value={year}>
          <SelectTrigger className="w-28 h-8">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Framework</span>
        <Select onValueChange={(v) => setFramework(v)} value={framework}>
          <SelectTrigger className="w-44 h-8">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            {frameworkOptions.map((f) => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
