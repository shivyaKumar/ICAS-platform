"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  type Division = { name: string; percent: number };
  type Framework = { name: string; percent: number; divisions: Division[] };

  const frameworks: Framework[] = [
    { name: "ISO 27001", percent: 0, divisions: [] },
    { name: "NIST CSF", percent: 0, divisions: [] },
    { name: "GDPR", percent: 0, divisions: [] },
  ];

  const getProgressColor = (percent: number) => {
    if (percent >= 70) return "bg-green-500";
    if (percent >= 40) return "bg-yellow-400";
    return "bg-red-500";
  };

  // ✅ Navy blue gradient for top metrics
  const metricGradient =
    "bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent";

  // ✅ Framework-specific gradients
  const getFrameworkGradient = (framework: string) => {
    switch (framework) {
      case "ISO 27001":
        return "bg-gradient-to-r from-orange-500 to-amber-900 bg-clip-text text-transparent"; // 🔶 Orange
      case "NIST CSF":
        return "bg-gradient-to-r from-emerald-500 to-green-900 bg-clip-text text-transparent"; // 🟢 Green
      case "GDPR":
        return "bg-gradient-to-r from-purple-500 to-pink-900 bg-clip-text text-transparent"; // 🟣 Purple/Pink
      default:
        return "text-gray-800";
    }
  };

  return (
    <div className="flex flex-col space-y-8 min-h-full overflow-auto p-6 
                    bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-700">
          Monitor compliance progress and manage assessments across divisions
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Overall Compliance", value: "0%" },
          { title: "Active Assessments", value: "0", subtitle: "Ongoing across divisions" },
          { title: "Completed", value: "0", subtitle: "Assessments closed" },
          { title: "Pending Reviews", value: "0", subtitle: "Awaiting admin action" },
        ].map((item) => (
          <Card
            key={item.title}
            className="bg-white shadow-md rounded-xl border border-gray-100 
                       hover:shadow-2xl hover:scale-105 transform transition-all duration-300 ease-in-out"
          >
            <CardHeader>
              <CardTitle className="text-gray-800 text-base font-semibold">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-extrabold ${metricGradient}`}>
                {item.value}
              </div>
              {item.subtitle && (
                <p className="text-sm text-gray-500">{item.subtitle}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Framework Compliance */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Framework Compliance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {frameworks.map((fw) => (
            <Card
              key={fw.name}
              className="bg-white shadow-md rounded-xl border border-gray-100 
                         hover:shadow-2xl hover:scale-105 transform transition-all duration-300 ease-in-out"
            >
              <CardHeader>
                <CardTitle
                  className={`text-2xl font-bold ${getFrameworkGradient(fw.name)}`}
                >
                  {fw.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-5xl font-extrabold ${getFrameworkGradient(fw.name)}`}
                >
                  {fw.percent}%
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
                  <div
                    className={`h-2 ${getProgressColor(fw.percent)} rounded-full`}
                    style={{ width: `${fw.percent}%` }}
                  />
                </div>

                {fw.divisions.length > 0 ? (
                  <div className="mt-4 space-y-1 text-sm">
                    {fw.divisions.map((div) => (
                      <div
                        key={div.name}
                        className="flex justify-between text-gray-700"
                      >
                        <span>{div.name}</span>
                        <span className="font-medium">{div.percent}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-gray-400 italic">
                    No data available yet
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
