"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* Types (future-proof) */
type DivisionProg = { name: string; percent: number };
type FrameworkProg = { name: string; percent: number; divisions: DivisionProg[] };

/* --- Styling helpers (match Admin) --- */
const metricGradient =
  "bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent";

const getProgressColor = (p: number) =>
  p >= 70 ? "bg-green-500" : p >= 40 ? "bg-yellow-400" : "bg-red-500";

const getFrameworkGradient = (fw: string) => {
  switch (fw) {
    case "ISO 27001":
      return "bg-gradient-to-r from-orange-500 to-amber-900 bg-clip-text text-transparent";
    case "NIST CSF":
      return "bg-gradient-to-r from-emerald-500 to-green-900 bg-clip-text text-transparent";
    case "GDPR":
      return "bg-gradient-to-r from-purple-500 to-pink-900 bg-clip-text text-transparent";
    default:
      return "text-gray-800";
  }
};

export default function StaffDashboardPage() {
  // Top-line metrics (zeros for now; easy to swap with API)
  const overallCompliance = 0;
  const assignedCount = 0;
  const changesRequestedCount = 0;
  const completedCount = 0;

  const frameworks: FrameworkProg[] = [
    { name: "ISO 27001", percent: 0, divisions: [] },
    { name: "NIST CSF", percent: 0, divisions: [] },
    { name: "GDPR", percent: 0, divisions: [] },
  ];

  return (
    <div
      className="flex flex-col space-y-8 min-h-full overflow-auto
                 px-3 sm:px-4 md:px-6 py-4
                 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-sm md:text-base text-gray-700">
          Assessments for your division and the current compliance status across frameworks
        </p>
      </div>

      {/* Metric Cards — split Active into two cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 min-w-0">
        {[
          { title: "Overall Compliance", value: `${overallCompliance}%` },
          { title: "Assigned Tasks", value: String(assignedCount), subtitle: "Assigned to you" },
          { title: "Changes Requested", value: String(changesRequestedCount), subtitle: "Returned by admin" },
          { title: "Completed", value: String(completedCount), subtitle: "Assessments closed" },
        ].map((item) => (
          <Card
            key={item.title}
            className="bg-white shadow-md rounded-xl border border-gray-100 
                       hover:scale-105 hover:shadow-2xl 
                       transform transition-transform duration-300 ease-in-out"
          >
            <CardHeader>
              <CardTitle className="text-gray-800 text-sm md:text-base font-semibold">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl md:text-4xl font-extrabold ${metricGradient}`}>
                {item.value}
              </div>
              {item.subtitle && (
                <p className="text-xs md:text-sm text-gray-500">{item.subtitle}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No detail list here — that lives on the My Task page */}

      {/* Framework Compliance — same visual as Admin */}
      <div>
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Framework Compliance</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 min-w-0">
          {frameworks.map((fw) => (
            <Card
              key={fw.name}
              className="bg-white shadow-md rounded-xl border border-gray-100 
                         hover:scale-105 hover:shadow-2xl 
                         transform transition-transform duration-300 ease-in-out"
            >
              <CardHeader>
                <CardTitle className={`text-xl md:text-2xl font-bold ${getFrameworkGradient(fw.name)}`}>
                  {fw.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-4xl md:text-5xl font-extrabold ${getFrameworkGradient(fw.name)}`}>
                  {fw.percent}%
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
                  <div
                    className={`h-2 ${getProgressColor(fw.percent)} rounded-full`}
                    style={{ width: `${fw.percent}%` }}
                  />
                </div>

                {fw.divisions.length > 0 ? (
                  <div className="mt-4 space-y-1 text-xs md:text-sm">
                    {fw.divisions.map((d) => (
                      <div key={`${fw.name}-${d.name}`} className="flex justify-between text-gray-700">
                        <span>{d.name}</span>
                        <span className="font-medium">{d.percent}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-gray-400 italic">No data available yet</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
