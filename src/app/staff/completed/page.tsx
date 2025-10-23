"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  if (!raw || typeof raw !== "object") {
    return {
      id: index + 1,
      framework: "",
      division: "",
      branch: "",
      location: "",
      status: "Completed",
      closedAt: "",
      closedBy: "",
      progressRate: null,
    };
  }

  const item = raw as Record<string, unknown>;
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
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function formatProgress(progress: number | null): string {
  if (progress == null) return "—";
  return `${Math.round(progress)}%`;
}

export default function StaffCompletedPage() {
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
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error && err.message.trim().length > 0
              ? err.message
              : "Unable to load completed assessments.";
          setError(message);
        }
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
    if (loading) {
      return (
        <Card>
          <CardContent className="p-6 text-center text-sm text-gray-500">
            Loading completed assessments…
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <CardContent className="p-6 text-center text-sm text-red-600">{error}</CardContent>
        </Card>
      );
    }

    if (!items.length) {
      return (
        <Card>
          <CardContent className="p-6 text-center text-sm text-gray-500 italic">
            No completed assessments for your branch yet.
          </CardContent>
        </Card>
      );
    }

    return items.map((item) => (
      <Card key={item.id}>
        <CardHeader>
          <CardTitle className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold">
              {item.framework} — {item.branch} ({item.division})
            </span>
            <span className="flex items-center gap-2 text-sm text-gray-500">
              <Badge variant="primary">Completed</Badge>
              <span>{formatDate(item.closedAt)}</span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <span className="font-medium text-gray-900">Location:</span> {item.location || "—"}
            </div>
            <div>
              <span className="font-medium text-gray-900">Closed By:</span> {item.closedBy}
            </div>
            <div>
              <span className="font-medium text-gray-900">Progress:</span>{" "}
              {formatProgress(item.progressRate)}
            </div>
          </div>

          <div className="flex gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link href={`/staff/assessments/${encodeURIComponent(String(item.id))}`}>
                View Assessment
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    ));
  }, [error, items, loading]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Completed Assessments</h1>
        <p className="text-sm text-gray-600">
          Closed assessments for your branch/division appear here for reference.
        </p>
      </div>

      {content}

      <div className="flex justify-end">
        <Button asChild size="sm" variant="secondary">
          <Link href="/staff/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
