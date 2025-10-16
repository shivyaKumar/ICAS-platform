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
          <td colSpan={8} className="px-5 py-8 text-center text-gray-500">
            Loading...
          </td>
        </tr>
      );

    if (error)
      return (
        <tr>
          <td colSpan={8} className="px-5 py-8 text-center text-red-600">
            {error}
          </td>
        </tr>
      );

    if (!items.length)
      return (
        <tr>
          <td colSpan={8} className="px-5 py-8 text-center text-gray-400 italic">
            No assessments found for your branch.
          </td>
        </tr>
      );

    return items.map((item) => (
      <tr key={item.id} className="border-t">
        <td className="px-5 py-3 font-medium">{item.framework}</td>
        <td className="px-5 py-3">{item.division || "-"}</td>
        <td className="px-5 py-3">{item.branch || "-"}</td>
        <td className="px-5 py-3">{item.location || "-"}</td>
        <td className="px-5 py-3">{item.createdBy || "-"}</td>
        <td className="px-5 py-3">{formatDate(item.assessmentDate)}</td>
        <td className="px-5 py-3">{formatDate(item.dueDate)}</td>
        <td className="px-5 py-3">
          <Badge className="bg-blue-100 text-blue-700">{formatProgress(item.progressRate)}</Badge>
        </td>
        <td className="px-5 py-3">
          <Button asChild size="sm" variant="secondary">
            <Link href={`/staff/assessments/${encodeURIComponent(String(item.id))}`}>Open</Link>
          </Button>
        </td>
      </tr>
    ));
  }, [items, loading, error]);

  return (
    <div className="p-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-2xl">My Assessments</CardTitle>
          <p className="text-sm text-gray-600">
            View all active assessments assigned to your branch.
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-5 py-3 font-semibold">Framework</th>
                  <th className="px-5 py-3 font-semibold">Division</th>
                  <th className="px-5 py-3 font-semibold">Branch</th>
                  <th className="px-5 py-3 font-semibold">Location</th>
                  <th className="px-5 py-3 font-semibold">Created By</th>
                  <th className="px-5 py-3 font-semibold">Assessment Date</th>
                  <th className="px-5 py-3 font-semibold">Due Date</th>
                  <th className="px-5 py-3 font-semibold">Progress</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
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
