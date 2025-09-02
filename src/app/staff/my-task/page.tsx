"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ---------------- Types ---------------- */
type Status = "Assigned" | "Changes Requested" | "Submitted" | "Completed" | string;

type Assessment = {
  id: string;
  framework: string;
  division: string;
  status: Status;
};

/* -------------- Small helpers -------------- */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function str(v: unknown, fb = ""): string {
  return typeof v === "string" ? v : fb;
}

/* Optional local filter by division */
function getLocalDivision(): string | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem("user_division");
  return v && v.trim().length > 0 ? v.trim() : null;
}

export default function StaffMyTasksPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE?.trim() ?? "";
  const useMock = apiBase.length === 0;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        if (useMock) {
          const mock: Assessment[] = [
            { id: "A-101", framework: "ISO 27001", division: "Finance", status: "Assigned" },
            { id: "A-102", framework: "NIST CSF", division: "Finance", status: "Changes Requested" },
            { id: "A-201", framework: "GDPR", division: "HR", status: "Assigned" },
          ];
          if (!cancelled) setAssessments(mock);
          return;
        }

        const base = apiBase.replace(/\/+$/, "");
        const url = `${base}/assessments?divisionId=me&activeOnly=true`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);

        const raw: unknown = await res.json();
        const items: Assessment[] = Array.isArray(raw)
          ? raw.map((a, i) => {
              if (!isRecord(a)) return { id: String(i + 1), framework: "", division: "", status: "Assigned" };
              return {
                id: str(a.id, String(i + 1)),
                framework: str(a.frameworkName ?? a.framework ?? a.name),
                division: str(a.divisionName ?? a.division ?? a.department),
                status: str(a.status, "Assigned"),
              };
            })
          : [];

        if (!cancelled) setAssessments(items);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unable to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [apiBase, useMock]);

  const actionable = useMemo(
    () => assessments.filter((a) => a.status === "Assigned" || a.status === "Changes Requested"),
    [assessments]
  );

  const myDivision = getLocalDivision();
  const mine = useMemo(() => {
    if (!myDivision) return actionable;
    return actionable.filter((a) => a.division.toLowerCase() === myDivision.toLowerCase());
  }, [actionable, myDivision]);

  const StatusBadge = ({ s }: { s: string }) => {
    switch (s) {
      case "Assigned":
        return <Badge className="bg-yellow-100 text-yellow-800">Assigned</Badge>;
      case "Changes Requested":
        return <Badge className="bg-red-100 text-red-800">Changes Requested</Badge>;
      case "Submitted":
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case "Completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="secondary">{s}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-sm md:text-base text-gray-700">
          Items currently assigned to your division that need your action.
        </p>
      </div>

      <Card className="bg-white shadow-md rounded-xl border border-gray-100">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Open Items</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">Loading…</div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-red-600">{error}</div>
          ) : mine.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500 italic">No tasks</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr className="text-gray-700">
                    <th className="px-5 py-3">Framework</th>
                    <th className="px-5 py-3">Division</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mine.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="px-5 py-3 font-medium">{a.framework}</td>
                      <td className="px-5 py-3">{a.division}</td>
                      <td className="px-5 py-3"><StatusBadge s={a.status} /></td>
                      <td className="px-5 py-3">
                        <Button asChild size="sm" variant="secondary">
                          <Link href={`/staff/assessments/${encodeURIComponent(a.id)}`}>Open</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
