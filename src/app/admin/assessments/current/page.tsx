"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type AssessmentListItem = {
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

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString().slice(0, 10);
};

const formatProgress = (value?: number | null) => {
  if (value === null || value === undefined) return "0% Complete";
  const rounded = Math.round(value * 10) / 10;
  return `${rounded}% Complete`;
};

export default function CurrentAssessmentsPage() {
  const [items, setItems] = useState<AssessmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState<number | null>(null);

  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/assessments?isClosed=false", { cache: "no-store" });
      if (!response.ok) throw new Error(await response.text());

      const payload = (await response.json()) as AssessmentListItem[];
      setItems(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error("Failed to load assessments", err);
      setError("Failed to load assessments. Please try again.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const handleCloseAssessment = useCallback(async (id: number) => {
    if (!confirm("Close this assessment?")) return;

    try {
      setClosing(id);
      const response = await fetch(`/api/assessments/${id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error(await response.text());
      alert("Assessment closed successfully.");
      fetchAssessments();
    } catch (err) {
      console.error("Failed to close assessment", err);
      alert("Unable to close assessment. Please try again.");
    } finally {
      setClosing(null);
    }
  }, [fetchAssessments]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <tr>
          <td colSpan={8} className="px-5 py-8 text-center text-gray-600">
            Loading...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={8} className="px-5 py-8 text-center text-red-600">
            {error}
          </td>
        </tr>
      );
    }

    if (!items.length) {
      return (
        <tr>
          <td colSpan={8} className="px-5 py-8 text-center text-gray-500">
            No current assessments.
          </td>
        </tr>
      );
    }

    return items.map((item) => {
      const progressText = formatProgress(item.progressRate ?? 0);
      return (
        <tr key={item.id} className="border-t">
          <td className="px-5 py-3 font-medium whitespace-nowrap">{item.framework || "-"}</td>
          <td className="px-5 py-3 whitespace-nowrap">{item.division || "-"}</td>
          <td className="px-5 py-3 whitespace-nowrap">{item.branch || "-"}</td>
          <td className="px-5 py-3 whitespace-nowrap">{item.location || "-"}</td>
          <td className="px-5 py-3 whitespace-nowrap">{item.createdBy || "-"}</td>
          <td className="px-5 py-3 whitespace-nowrap">{formatDate(item.assessmentDate)}</td>
          <td className="px-5 py-3 whitespace-nowrap">{formatDate(item.dueDate)}</td>
          <td className="px-5 py-3 whitespace-nowrap">
            <Badge className="bg-orange-100 text-orange-700">
              {progressText}
            </Badge>
          </td>
          <td className="px-5 py-3 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="secondary">
                <Link href={`/admin/assessments/current/${encodeURIComponent(String(item.id))}`}>
                  Review
                </Link>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleCloseAssessment(item.id)}
                disabled={closing === item.id}
              >
                {closing === item.id ? "Closing..." : "Close"}
              </Button>
            </div>
          </td>
        </tr>
      );
    });
  }, [items, loading, error, closing, handleCloseAssessment]);

  return (
    <div className="p-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-2xl">Current Assessments</CardTitle>
          <p className="text-sm text-gray-600">
            View all ongoing compliance assessments and their completion rate.
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
