"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SummaryCards({
  overallCompliancePercent,
  activeAssessments,
  completedAssessments,
  nonCompliantControls,
}: {
  overallCompliancePercent: number;
  activeAssessments: number;
  completedAssessments: number;
  nonCompliantControls: number;
}) {
  const metricGradient = "bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent";
  const cards = [
    { title: "Overall Compliance", value: `${Math.round(overallCompliancePercent)}%` },
    { title: "Active Assessments", value: String(activeAssessments) },
    { title: "Completed Assessments", value: String(completedAssessments) },
    { title: "Non-Compliant Controls", value: String(nonCompliantControls) },
  ];
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((m) => (
        <Card key={m.title} className="bg-white shadow-sm rounded-xl border border-gray-100">
          <CardHeader>
            <CardTitle className="text-gray-800 text-sm md:text-base font-semibold">
              {m.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl md:text-3xl font-extrabold ${metricGradient}`}>{m.value}</div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
