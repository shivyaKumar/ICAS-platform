"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ---------- Types (no any) ---------- */
type Outcome = "Pending" | "Approved" | "Rejected" | "ChangesRequested";

type ControlRow = {
  id: string;
  name: string;
  status: Outcome;           // staff-submitted (final state at completion)
  implementation?: string;
  gapDescription?: string;
  assignedTo?: string;
  evidence?: string;
  review?: Outcome;          // admin decision if applicable
  comments?: string;
  reviewDate?: string;       // ISO yyyy-mm-dd
};

type CompletedAssessment = {
  id: string;
  framework: string;
  division: string;
  date: string;              // ISO date string
  status: "Completed";
  controls: ControlRow[];
};

/* ---------- Small safe helpers ---------- */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function pickString(o: Record<string, unknown>, keys: string[], fb = ""): string {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string") return v;
  }
  return fb;
}
function pickArray(o: Record<string, unknown>, key: string): unknown[] {
  const v = o[key];
  return Array.isArray(v) ? v : [];
}
function asOutcome(v: string): Outcome {
  return v === "Approved" || v === "Rejected" || v === "ChangesRequested" ? v : "Pending";
}

/* Map unknown -> CompletedAssessment (read-only) */
function mapCompleted(u: unknown, i: number): CompletedAssessment {
  if (!isRecord(u)) {
    return {
      id: String(i + 1),
      framework: "",
      division: "",
      date: "",
      status: "Completed",
      controls: [],
    };
  }
  const id = pickString(u, ["id"], String(i + 1));
  const framework = pickString(u, ["framework", "frameworkName"]);
  const division = pickString(u, ["division", "divisionName", "department"]);
  const date = pickString(u, ["date", "completedAt", "createdAt"]);
  const statusRaw = pickString(u, ["status"], "Completed");
  const status: "Completed" = statusRaw === "Completed" ? "Completed" : "Completed";

  const ctrlRaw = pickArray(u, "controls");
  const controls: ControlRow[] = ctrlRaw.map((c, j) => {
    if (!isRecord(c)) {
      return { id: `c${j + 1}`, name: "", status: "Pending" };
    }
    return {
      id: pickString(c, ["id", "code"], `c${j + 1}`),
      name: pickString(c, ["name", "title"]),
      status: asOutcome(pickString(c, ["status"])),
      implementation: pickString(c, ["implementation"]) || undefined,
      gapDescription: pickString(c, ["gapDescription", "gap"]) || undefined,
      assignedTo: pickString(c, ["assignedTo", "owner"]) || undefined,
      evidence: pickString(c, ["evidence", "evidenceUrl"]) || undefined,
      review: asOutcome(pickString(c, ["review", "adminDecision"])),
      comments: pickString(c, ["comments"]) || undefined,
      reviewDate: pickString(c, ["reviewDate"]) || undefined,
    };
  });

  return { id, framework, division, date, status, controls };
}

/* ---------- Visual helpers ---------- */
function OutcomeBadge({ value }: { value: Outcome }) {
  switch (value) {
    case "Approved":
      return <Badge variant="primary">Approved</Badge>;
    case "Rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "ChangesRequested":
      return <Badge variant="secondary">Changes Requested</Badge>;
    case "Pending":
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
}

/* ---------- Component ---------- */
export default function StaffCompletedPage() {
  const [items, setItems] = useState<CompletedAssessment[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBase = (process.env.NEXT_PUBLIC_API_BASE ?? "").trim();
  const useMock = apiBase.length === 0;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        if (useMock) {
          // ---- Mock for UI preview only. Remove when API is wired.
          const demo: CompletedAssessment[] = [
            {
              id: "A-101",
              framework: "ISO 27001",
              division: "Max Value",
              date: "2025-09-12",
              status: "Completed",
              controls: [
                {
                  id: "A.5.1.1",
                  name: "Information Security Policy",
                  status: "Approved",
                  implementation: "In place",
                  assignedTo: "Alice",
                  evidence: "policy.pdf",
                  review: "Approved",
                  comments: "Looks good",
                  reviewDate: "2025-09-13",
                },
                {
                  id: "A.9.2.1",
                  name: "Access Control",
                  status: "Approved",
                  implementation: "RBAC enforced",
                  assignedTo: "Bob",
                  evidence: "access-matrix.xlsx",
                  review: "Approved",
                  comments: "",
                  reviewDate: "2025-09-13",
                },
              ],
            },
          ];
          if (!cancelled) setItems(demo);
          return;
        }

        const base = apiBase.replace(/\/+$/, "");
        // Let the backend scope by the signed-in staff’s division
        const url = `${base}/assessments?status=Completed&divisionId=me`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        const raw: unknown = await res.json();
        const list = Array.isArray(raw) ? raw.map(mapCompleted) : [];
        if (!cancelled) setItems(list);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unable to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [apiBase, useMock]);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Completed Assessments</h1>
        <p className="text-sm text-gray-600">
          Read-only records for <span className="font-medium">your division</span>.
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-gray-500">Loading…</CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-red-600">{error}</CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-gray-500 italic">
            No completed assessments.
          </CardContent>
        </Card>
      ) : (
        items.map((a) => (
          <Card key={a.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-semibold text-base">
                  {a.framework} — {a.division}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="primary">Completed</Badge>
                  <span className="text-sm text-gray-500">
                    {a.date ? new Date(a.date).toLocaleDateString() : "-"}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {/* Keep only View/Hide Controls + PDF actions */}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => toggleExpand(a.id)}
                >
                  {expanded[a.id] ? "Hide Controls" : "View Controls"}
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => alert("PDF Generation")}
                >
                  Generate PDF Report
                </Button>
              </div>

              {expanded[a.id] && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="border p-2 text-left">ID</th>
                        <th className="border p-2 text-left">Control</th>
                        <th className="border p-2 text-left">Outcome</th>
                        <th className="border p-2 text-left">Implementation</th>
                        <th className="border p-2 text-left">Gap Description</th>
                        <th className="border p-2 text-left">Assigned To</th>
                        <th className="border p-2 text-left">Evidence</th>
                        <th className="border p-2 text-left">Comments</th>
                        <th className="border p-2 text-left">Review Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.controls.map((c, idx) => {
                        const outcome: Outcome = c.review ?? c.status;
                        return (
                          <tr key={`${a.id}-${c.id}-${idx}`} className="border-b">
                            <td className="border p-2">{c.id}</td>
                            <td className="border p-2">{c.name}</td>
                            <td className="border p-2"><OutcomeBadge value={outcome} /></td>
                            <td className="border p-2">{c.implementation || "-"}</td>
                            <td className="border p-2">{c.gapDescription || "-"}</td>
                            <td className="border p-2">{c.assignedTo || "-"}</td>
                            <td className="border p-2">
                              {c.evidence ? (
                                <a
                                  href={c.evidence}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline text-blue-600"
                                >
                                  View
                                </a>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="border p-2">
                              <Label htmlFor={`cmt-${a.id}-${c.id}`} className="sr-only">
                                Comments
                              </Label>
                              <Input
                                id={`cmt-${a.id}-${c.id}`}
                                type="text"
                                value={c.comments || ""}
                                readOnly
                              />
                            </td>
                            <td className="border p-2">{c.reviewDate || "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}

      <div className="flex justify-end">
        <Button asChild size="sm" variant="secondary">
          <Link href="/staff/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}