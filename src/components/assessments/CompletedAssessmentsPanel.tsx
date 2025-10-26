"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type CompletedAssessment = {
  id: number;
  framework: string;
  division: string;
  branch: string;
  location: string;
  status: string;
  closedAt: string;
  closedBy: string;
  progressRate: number | null;
};

export default function CompletedAssessmentsPanel({
  basePath = "/admin/assessments/completed",
}: {
  basePath?: string;
}) {
  const [items, setItems] = useState<CompletedAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/assessments/completed", { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (cancelled) return;
        setItems(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setError("Failed to load completed assessments");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
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
            No completed assessments found.
          </td>
        </tr>
      );

    return items.map((a, index) => (
      <tr
        key={a.id}
        className={`${
          index % 2 === 0 ? "bg-white" : "bg-gray-50"
        } border-b border-gray-200 hover:bg-gray-100 transition`}
      >
        <td className="px-5 py-3 text-gray-800 font-medium whitespace-nowrap border-r border-gray-200">
          {a.framework}
        </td>
        <td className="px-5 py-3 whitespace-nowrap border-r border-gray-200">
          {a.division}
        </td>
        <td className="px-5 py-3 whitespace-nowrap border-r border-gray-200">
          {a.branch}
        </td>
        <td className="px-5 py-3 whitespace-nowrap border-r border-gray-200">
          {a.location}
        </td>
        <td className="px-5 py-3 whitespace-nowrap border-r border-gray-200">
          {a.closedBy}
        </td>
        <td className="px-5 py-3 whitespace-nowrap border-r border-gray-200">
          {a.closedAt}
        </td>
        <td className="px-5 py-3 whitespace-nowrap border-r border-gray-200 text-center">
          <Badge className="bg-orange-100 text-orange-700 border border-orange-200 px-2 py-1 text-xs font-medium">
            {a.progressRate ?? "—"}%
          </Badge>
        </td>
        <td className="px-5 py-3 whitespace-nowrap text-right">
          <Button asChild size="sm" variant="secondary">
            <Link href={`${basePath}/${a.id}`}>View</Link>
          </Button>
        </td>
      </tr>
    ));
  }, [items, loading, error, basePath]);

  return (
    <div className="p-0">
      <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
        {/* --- Header --- */}
        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
            Completed Assessments
          </CardTitle>
          <p className="text-sm text-gray-600">
            View all assessments that have been reviewed and marked as complete.
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
                    Closed By
                  </th>
                  <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wide text-left border-b border-gray-300">
                    Closed At
                  </th>
                  <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wide text-center border-b border-gray-300">
                    Progress
                  </th>
                  <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wide text-right border-b border-gray-300">
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
