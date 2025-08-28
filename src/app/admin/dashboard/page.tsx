"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function AdminDashboardPage() {
  // Mock division-level compliance data
  const frameworks = [
    {
      name: "ISO 27001",
      percent: 62,
      color: "text-blue-600",
      divisions: [
        { name: "Finance", percent: 70 },
        { name: "IT", percent: 55 },
        { name: "HR", percent: 60 },
      ],
    },
    {
      name: "NIST CSF",
      percent: 67,
      color: "text-purple-600",
      divisions: [
        { name: "Finance", percent: 72 },
        { name: "Operations", percent: 64 },
        { name: "HR", percent: 66 },
      ],
    },
    {
      name: "GDPR",
      percent: 55,
      color: "text-pink-600",
      divisions: [
        { name: "Finance", percent: 58 },
        { name: "Sales", percent: 50 },
        { name: "HR", percent: 54 },
      ],
    },
  ];

  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex flex-col space-y-8 min-h-full overflow-auto p-6 bg-gray-50">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">
          Monitor compliance progress and manage assessments across divisions
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">78%</div>
            <Progress value={78} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-gray-500">Ongoing across divisions</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">34</div>
            <p className="text-xs text-gray-500">Assessments closed</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">7</div>
            <p className="text-xs text-gray-500">Awaiting admin action</p>
          </CardContent>
        </Card>
      </div>

      {/* Framework Compliance */}
      <div>
        <h2 className="text-xl font-bold mb-4">Framework Compliance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {frameworks.map((fw) => (
            <Card
              key={fw.name}
              className="shadow-md cursor-pointer hover:shadow-lg transition"
              onClick={() =>
                setExpanded(expanded === fw.name ? null : fw.name)
              }
            >
              <CardHeader>
                <CardTitle className="text-sm font-medium">{fw.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${fw.color}`}>
                  {fw.percent}%
                </div>
                <Progress value={fw.percent} className="mt-2" />

                {/* Expandable Division Breakdown */}
                {expanded === fw.name && (
                  <div className="mt-4 space-y-2">
                    {fw.divisions.map((div) => (
                      <div
                        key={div.name}
                        className="flex justify-between text-sm border-b pb-1"
                      >
                        <span>{div.name}</span>
                        <span className="font-medium">{div.percent}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
