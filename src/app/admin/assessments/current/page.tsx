"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ---------- Types (only two statuses now) ---------- */
type ReviewDecision = "" | "Approved" | "ChangesRequested" | "Rejected";
type ComplianceStatus = "Pending" | "Compliant" | "NonCompliant";
type AssessmentStatus = "InProgress" | "Submitted";

type Control = {
  id: string;
  name: string;
  status: ComplianceStatus;
  implementation: string;
  gapDescription: string;
  assignedTo: string;
  evidence: string;
  review: ReviewDecision;
  comments: string;
  reviewDate: string;
};

type Assessment = {
  id: number;
  framework: string;
  division: string;
  date: string;           // shown as plain text (no brackets)
  status: AssessmentStatus;
  controls: Control[];
};

/* ---------- Helpers (no any) ---------- */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function g<T = unknown>(o: unknown, k: string): T | undefined {
  return isRecord(o) ? (o as Record<string, unknown>)[k] as T : undefined;
}
function s(v: unknown, f = ""): string {
  return typeof v === "string" ? v : f;
}
function n(v: unknown, f = 0): number {
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : f;
}

/* Map backend status names to the two we expose in UI */
function normalizeStatus(raw: string): AssessmentStatus {
  if (raw === "Submitted") return "Submitted";
  // treat anything else that means “still being worked on” as InProgress
  // (e.g. "Active", "Draft", etc.)
  return "InProgress";
}

/* ---------- Mappers ---------- */
function controlFromUnknown(u: unknown, j: number): Control {
  const id = s(g<string>(u, "id"), `c${j + 1}`);
  return {
    id,
    name: s(g<string>(u, "name")),
    status: ((): ComplianceStatus => {
      const x = s(g<string>(u, "status"));
      return x === "Compliant" || x === "NonCompliant" || x === "Pending" ? x : "Pending";
    })(),
    implementation: s(g<string>(u, "implementation")),
    gapDescription: s(g<string>(u, "gapDescription")),
    assignedTo: s(g<string>(u, "assignedTo")),
    evidence: s(g<string>(u, "evidence")),
    review: ((): ReviewDecision => {
      const x = s(g<string>(u, "review"));
      return x === "" || x === "Approved" || x === "ChangesRequested" || x === "Rejected" ? x : "";
    })(),
    comments: s(g<string>(u, "comments")),
    reviewDate: s(g<string>(u, "reviewDate")),
  };
}

function assessmentFromUnknown(u: unknown, i: number): Assessment {
  const rawDate = s(g<string>(u, "date"));
  const date = rawDate || new Date().toISOString().slice(0, 10); // ensure no empty "()"
  const rawStatus = s(g<string>(u, "status"), "InProgress");
  const controlsRaw = g<unknown>(u, "controls");

  return {
    id: n(g<number>(u, "id"), i + 1),
    framework: s(g<string>(u, "framework")),
    division: s(g<string>(u, "division")),
    date,
    status: normalizeStatus(rawStatus),
    controls: Array.isArray(controlsRaw) ? controlsRaw.map((c, j) => controlFromUnknown(c, j)) : [],
  };
}

/* ---------- localStorage helpers ---------- */
const LS_CURRENT = "current_assessments";
function readCurrentFromStorage(): Assessment[] {
  try {
    const raw = localStorage.getItem(LS_CURRENT);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((a, i) => assessmentFromUnknown(a, i));
  } catch {
    return [];
  }
}

/* ---------- UI helpers ---------- */
function StatusPill({ status }: { status: AssessmentStatus }) {
  if (status === "InProgress") {
    return <Badge className="bg-yellow-100 text-yellow-800">In&nbsp;Progress</Badge>;
  }
  return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
}

/* ---------- Component ---------- */
export default function AdminCurrentList() {
  const [items, setItems] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();

    async function fetchList(url: string) {
      const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
      if (!res.ok) return [] as unknown[];
      const data: unknown = await res.json();
      return Array.isArray(data) ? data : [];
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Try common server filters; normalize to 2 statuses
        const results: unknown[] = [
          ...(await fetchList("/api/assessments?scope=current")),   // if supported
          ...(await fetchList("/api/assessments?status=Active")),   // map to InProgress
          ...(await fetchList("/api/assessments?status=Submitted")),
        ];

        const mapped = results.map(assessmentFromUnknown);
        // dedupe by id
        const dedup = Array.from(new Map(mapped.map(a => [String(a.id), a])).values());

        if (dedup.length) {
          try { localStorage.setItem(LS_CURRENT, JSON.stringify(dedup)); } catch {}
          setItems(dedup);
        } else {
          setItems(readCurrentFromStorage());
        }
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          setError("Failed to load assessments");
          setItems(readCurrentFromStorage());
        }
      } finally {
        setLoading(false);
      }
    })();

    const onStorage = (ev: StorageEvent) => {
      if (ev.key === LS_CURRENT) setItems(readCurrentFromStorage());
    };
    window.addEventListener("storage", onStorage);

    return () => {
      ctrl.abort();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <div className="p-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-2xl">Current Assessments</CardTitle>
          <p className="text-sm text-gray-600">
            Open an assessment to review controls and take action.
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-5 py-3">Framework</th>
                  <th className="px-5 py-3">Division</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-gray-600">Loading…</td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-red-600">{error}</td>
                  </tr>
                )}
                {!loading && !error && items.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="px-5 py-3 font-medium">{a.framework}</td>
                    <td className="px-5 py-3">{a.division}</td>
                    <td className="px-5 py-3">{a.date}</td>
                    <td className="px-5 py-3"><StatusPill status={a.status} /></td>
                    <td className="px-5 py-3">
                      <Button asChild size="sm">
                        <Link href={`/admin/assessments/current/${encodeURIComponent(String(a.id))}`}>
                          Open
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {!loading && !error && items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-gray-600">No current assessments.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
