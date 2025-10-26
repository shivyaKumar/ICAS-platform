"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type AssessmentItem = {
  id: number;
  framework: string;
  division?: string | null;
  branch?: string | null;
  location?: string | null;
  createdBy?: string | null;
  assessmentDate?: string | null;
  dueDate?: string | null;
  progressRate?: number | null;
};

const formatDate = (v?: string | null) => {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toISOString().slice(0, 10);
};

const formatProgress = (v?: number | null) => {
  if (v == null) return "0% Complete";
  const rounded = Math.round(v * 10) / 10;
  return `${rounded}% Complete`;
};

export default function StaffMyTasksPage() {
  const [items, setItems] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/my-task", { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as AssessmentItem[];
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load assessments", err);
        setError("Unable to load assessments.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const content = useMemo(() => {
    if (loading)
      return (
        <tr>
          <td colSpan={9} className="px-5 py-8 text-center text-gray-600">
            Loading...
          </td>
        </tr>
      );

    if (error)
      return (
        <tr>
          <td colSpan={9} className="px-5 py-8 text-center text-red-600">
            {error}
          </td>
        </tr>
      );

    if (!items.length)
      return (
        <tr>
          <td colSpan={9} className="px-5 py-8 text-center text-gray-500 italic">
            No assessments found for your branch.
          </td>
        </tr>
      );

    return items.map((item, index) => {
      const progressText = formatProgress(item.progressRate ?? 0);
      return (
        <tr
          key={item.id}
          className={`${
            index % 2 === 0 ? "bg-white" : "bg-gray-50"
          } border-b border-gray-200 hover:bg-gray-100 transition`}
        >
          <td className="px-5 py-3 text-gray-800 font-medium whitespace-nowrap border-r border-gray-200">
            {item.framework || "-"}
          </td>
          <td className="px-5 py-3 whitespace-nowrap border-r border-gray-200">
            {item.division || "-"}
          </td>
          <td className="px-5 py-3 whitespace-nowrap border-r border-gray-200">
            {item.branch || "-"}
          </td>
          <td className="px-5 py-3 whitespace-nowrap border-r border-gray-200">
            {item.location || "-"}
          </td>
          <td className="px-5 py-3 whitespace-nowrap border-r border-gray-200">
            {item.createdBy || "-"}
          </td>
          <td className="px-5 py-3 whitespace-nowrap border-r border-gray-200">
            {formatDate(item.assessmentDate)}
          </td>
          <td className="px-5 py-3 whitespace-nowrap border-r border-gray-200">
            {formatDate(item.dueDate)}
          </td>
          <td className="px-5 py-3 whitespace-nowrap border-r border-gray-200">
            <Badge className="bg-orange-100 text-orange-700 border border-orange-200 px-2 py-1 text-xs font-medium">
              {progressText}
            </Badge>
          </td>
          <td className="px-5 py-3 whitespace-nowrap">
            <div className="flex items-center gap-2">
              {/* OPEN BUTTON */}
              <Button asChild size="sm" variant="primary">
                <Link href={`/staff/assessments/${encodeURIComponent(String(item.id))}`}>
                  Open
                </Link>
              </Button>
            </div>
          </td>
        </tr>
      );
    });
  }, [items, loading, error]);

  return (
    <div className="p-0">
      <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
        {/* --- Header --- */}
        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
            My Assessments
          </CardTitle>
          <p className="text-sm text-gray-600">
            View all active assessments assigned to your branch.
          </p>
        </CardHeader>

        {/* --- Table --- */}
        <CardContent>
          <div className="rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm text-gray-800 border-separate border-spacing-0">
              <thead>
                <tr className="bg-[#D8E6FB] text-gray-800">
                  <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wide text-left border-b border-gray-300">
                    Framework
                  </th>
                  <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wide text-left border-b border-gray-300">
                    Division
                  </th>
                  <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wide text-left border-b border-gray-300">
                    Branch
                  </th>
                  <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wide text-left border-b border-gray-300">
                    Location
                  </th>
                  <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wide text-left border-b border-gray-300">
                    Created By
                  </th>
                  <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wide text-left border-b border-gray-300">
                    Assessment Date
                  </th>
                  <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wide text-left border-b border-gray-300">
                    Due Date
                  </th>
                  <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wide text-left border-b border-gray-300">
                    Progress
                  </th>
                  <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wide text-left border-b border-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>{content}</tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
