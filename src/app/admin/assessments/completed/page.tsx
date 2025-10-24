"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

function normalizeString(value: unknown, fallback = "—"): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function mapCompleted(raw: unknown, index: number): CompletedAssessment {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    id: Number(item.id) || index + 1,
    framework: normalizeString(item.framework),
    division: normalizeString(item.division),
    branch: normalizeString(item.branch),
    location: normalizeString(item.location),
    status: normalizeString(item.status, "Completed"),
    closedAt: normalizeString(item.closedAt, ""),
    closedBy: normalizeString(item.closedBy, "—"),
    progressRate: normalizeNumber(item.progressRate),
  };
}

function formatDate(value: string): string {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleString();
}

function formatProgress(p: number | null): string {
  if (p == null) return "—";
  return `${Math.round(p)}%`;
}

export default function AdminCompletedAssessmentsPage() {
  const [items, setItems] = useState<CompletedAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/assessments/completed", { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const data: unknown = await res.json();
        if (cancelled) return;
        const parsed = Array.isArray(data)
          ? data.map(mapCompleted).filter((x) => x.status.toLowerCase() === "completed")
          : [];
        setItems(parsed);
      } catch {
        if (!cancelled) setError("Unable to load completed assessments.");
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
        <div className="py-20 text-center text-gray-500 text-sm">
          Loading completed assessments…
        </div>
      );

    if (error)
      return (
        <div className="py-20 text-center text-red-600 text-sm">{error}</div>
      );

    if (!items.length)
      return (
        <div className="py-20 text-center text-gray-500 italic text-sm">
          No completed assessments found.
        </div>
      );

    return (
      <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
        <Table className="w-full text-sm">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">Framework</TableHead>
              <TableHead className="font-semibold text-gray-700">Division</TableHead>
              <TableHead className="font-semibold text-gray-700">Branch</TableHead>
              <TableHead className="font-semibold text-gray-700">Location</TableHead>
              <TableHead className="font-semibold text-gray-700">Closed By</TableHead>
              <TableHead className="font-semibold text-gray-700">Closed At</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Progress</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-medium text-gray-900">{item.framework}</TableCell>
                <TableCell>{item.division}</TableCell>
                <TableCell>{item.branch}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>{item.closedBy}</TableCell>
                <TableCell>{formatDate(item.closedAt)}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    className={`px-2 py-1 text-xs ${
                      (item.progressRate ?? 0) >= 100
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {formatProgress(item.progressRate)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="secondary">
                    <Link
                      href={`/admin/assessments/completed/${encodeURIComponent(String(item.id))}`}
                    >
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }, [error, items, loading]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Completed Assessments</h1>
        <p className="text-sm text-gray-600">
          A full record of all assessments that have been reviewed and closed.
        </p>
      </div>

      {content}
    </div>
  );
}
