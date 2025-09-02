"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ---------- Types ---------- */
type Status = "Assigned" | "Changes Requested" | "Submitted" | "Completed" | string;
type ComplianceStatus = "Pending" | "Compliant" | "NonCompliant";

type Control = {
  id: string;
  name: string;
  compliance?: ComplianceStatus;
  implementation?: string;  // editable
  gapDescription?: string;  // editable
  assignedTo?: string;      // read-only
  evidence?: string;        // editable (URL / object URL)
};

type Assessment = {
  id: string;
  framework: string;
  division: string;
  status: Status;
  date?: string;
  controls: Control[];
};

/* ---------- Helpers ---------- */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function pickString(o: Record<string, unknown>, keys: string[], fallback = ""): string {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string") return v;
  }
  return fallback;
}
function pickArray(o: Record<string, unknown>, key: string): unknown[] {
  const v = o[key];
  return Array.isArray(v) ? v : [];
}
function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.valueOf()) ? "—" : d.toLocaleDateString();
}
function normalizeCompliance(v: string): ComplianceStatus {
  return v === "Compliant" || v === "NonCompliant" ? v : "Pending";
}

const draftKey = (id: string) => `staff_assessment_draft_${id}`;

export default function StaffAssessmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE ?? "").trim();

  const [data, setData] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Load local draft first if present
        const stored = localStorage.getItem(draftKey(id));
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (isRecord(parsed)) {
            const restored = restoreFromUnknown(parsed, id);
            if (!cancelled) {
              setData(restored);
              setLoading(false);
              return;
            }
          }
        }

        // --- Mock (when no API yet) ---
        if (!apiBase) {
          const mock: Assessment = {
            id,
            framework: "ISO 27001",
            division: "Finance",
            status: "Assigned",
            date: "2025-09-12",
            controls: [
              {
                id: "A.5.1.1",
                name: "Information Security Policy",
                implementation: "Drafted",
                compliance: "Pending",
                gapDescription: "",
                assignedTo: "Alice",
                evidence: "",
              },
              {
                id: "A.9.2.1",
                name: "Access Control",
                implementation: "RBAC in progress",
                compliance: "Compliant",
                gapDescription: "",
                assignedTo: "Bob",
                evidence: "",
              },
            ],
          };
          if (!cancelled) {
            setData(mock);
            setLoading(false);
          }
          return;
        }

        // --- Real API baseline ---
        const base = apiBase.replace(/\/+$/, "");
        const res = await fetch(`${base}/staff/assessments/${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        const payload: unknown = await res.json();
        const parsed = restoreFromUnknown(payload, id);
        if (!cancelled) setData(parsed);
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
  }, [apiBase, id]);

  function restoreFromUnknown(payload: unknown, fallbackId: string): Assessment {
    if (!isRecord(payload)) {
      return { id: fallbackId, framework: "", division: "", status: "Assigned", controls: [] };
    }
    const framework = pickString(payload, ["framework", "frameworkName"]);
    const division  = pickString(payload, ["division", "divisionName", "department"]);
    const status    = pickString(payload, ["status"], "Assigned");
    const date      = pickString(payload, ["date", "createdAt", "assessmentDate"]);
    const rawCtrls  = pickArray(payload, "controls");

    const controls: Control[] = rawCtrls.map((c, i) => {
      if (!isRecord(c)) return { id: `c${i + 1}`, name: "" };
      const comp = pickString(c, ["compliance", "status"]);
      return {
        id:             pickString(c, ["id", "code"], `c${i + 1}`),
        name:           pickString(c, ["name", "title"]),
        compliance:     comp ? normalizeCompliance(comp) : "Pending",
        implementation: pickString(c, ["implementation"]) || "",
        gapDescription: pickString(c, ["gapDescription", "gap"]) || "",
        assignedTo:     pickString(c, ["assignedTo", "owner"]) || "",
        evidence:       pickString(c, ["evidence", "evidenceUrl"]) || "",
      };
    });

    return {
      id: pickString(payload, ["id"], String(fallbackId)),
      framework,
      division,
      status,
      date: date || undefined,
      controls,
    };
  }

  /* -------- Edits -------- */
  function updateCompliance(ctrlId: string, value: string) {
    setData(prev =>
      !prev
        ? prev
        : {
            ...prev,
            controls: prev.controls.map(c =>
              c.id === ctrlId ? { ...c, compliance: normalizeCompliance(value) } : c
            ),
          }
    );
  }

  function updateImplementation(ctrlId: string, value: string) {
    setData(prev =>
      !prev
        ? prev
        : {
            ...prev,
            controls: prev.controls.map(c =>
              c.id === ctrlId ? { ...c, implementation: value } : c
            ),
          }
    );
  }

  function updateGap(ctrlId: string, value: string) {
    setData(prev =>
      !prev
        ? prev
        : {
            ...prev,
            controls: prev.controls.map(c =>
              c.id === ctrlId ? { ...c, gapDescription: value } : c
            ),
          }
    );
  }

  // Object URL preview for now (replace with real upload later)
  function updateEvidence(ctrlId: string, file: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setData(prev =>
      !prev
        ? prev
        : {
            ...prev,
            controls: prev.controls.map(c =>
              c.id === ctrlId ? { ...c, evidence: url } : c
            ),
          }
    );
  }

  /* -------- Draft + Submit -------- */
  function saveDraft() {
    if (!data) return;
    setSaving(true);
    try {
      localStorage.setItem(draftKey(id), JSON.stringify(data));
      alert("Draft saved locally.");
    } finally {
      setSaving(false);
    }
  }

  function submitToAdmin() {
    if (!data) return;
    setSubmitting(true);
    try {
      const next: Assessment = { ...data, status: "Submitted" };
      setData(next);
      localStorage.setItem(draftKey(id), JSON.stringify(next));
      alert("Submitted (local mock). Wire this to your API next.");
    } finally {
      setSubmitting(false);
    }
  }

  const StatusChip = ({ s }: { s?: string }) =>
    s ? <Badge className="bg-gray-100 text-gray-800">{s}</Badge> : null;

  return (
    <div className="p-6 space-y-6">
      {/* Title + description */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Assessment Details</h1>
        <p className="text-sm md:text-base text-gray-700">
          Compliance status, implementation, gap description and evidence are editable.
        </p>

        {/* Back button under the header text */}
        <div className="mt-4">
          <Button asChild variant="secondary" size="sm">
            <Link href="/staff/my-task">← Back</Link>
          </Button>
        </div>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{data?.framework ?? "—"}</span>
            <span className="text-gray-500">—</span>
            <span className="text-gray-700">{data?.division ?? "—"}</span>

            <span className="ml-auto flex items-center gap-2">
              <StatusChip s={data?.status} />
              <Badge className="bg-gray-100 text-gray-800">{formatDate(data?.date)}</Badge>
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">Loading…</div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-red-600">{error}</div>
          ) : !data ? (
            <div className="py-10 text-center text-sm text-gray-500 italic">Not found</div>
          ) : data.controls.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500 italic">No controls yet</div>
          ) : (
            // --- Table styled like admin ---
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr className="text-gray-700">
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Control</th>
                    <th className="px-5 py-3">Compliance Status</th>
                    <th className="px-5 py-3">Implementation</th>
                    <th className="px-5 py-3">Gap Description</th>
                    <th className="px-5 py-3">Assigned To</th>
                    <th className="px-5 py-3">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {data.controls.map(c => (
                    <tr key={c.id} className="border-t align-top">
                      <td className="px-5 py-3 font-medium">{c.id}</td>
                      <td className="px-5 py-3">{c.name || "—"}</td>

                      {/* Compliance (editable select) */}
                      <td className="px-5 py-3">
                        <Label htmlFor={`cmp-${c.id}`} className="sr-only">Compliance</Label>
                        <select
                          id={`cmp-${c.id}`}
                          className="border rounded px-2 py-1 text-sm"
                          value={c.compliance ?? "Pending"}
                          onChange={(e) => updateCompliance(c.id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Compliant">Compliant</option>
                          <option value="NonCompliant">Non-Compliant</option>
                        </select>
                      </td>

                      {/* Implementation (editable Input) */}
                      <td className="px-5 py-3">
                        <Label htmlFor={`impl-${c.id}`} className="sr-only">Implementation</Label>
                        <Input
                          id={`impl-${c.id}`}
                          value={c.implementation ?? ""}
                          onChange={(e) => updateImplementation(c.id, e.target.value)}
                          placeholder="Describe implementation…"
                          className="w-64 md:w-80"
                        />
                      </td>

                      {/* Gap description (editable textarea) */}
                      <td className="px-5 py-3">
                        <Label htmlFor={`gap-${c.id}`} className="sr-only">Gap</Label>
                        <textarea
                          id={`gap-${c.id}`}
                          className="w-64 md:w-80 border rounded p-2 text-sm resize-y"
                          rows={2}
                          placeholder="Describe any gaps…"
                          value={c.gapDescription ?? ""}
                          onChange={(e) => updateGap(c.id, e.target.value)}
                        />
                      </td>

                      {/* Assigned To (read-only) */}
                      <td className="px-5 py-3">{c.assignedTo || "—"}</td>

                      {/* Evidence (file Input + View) */}
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`evi-${c.id}`} className="sr-only">Evidence</Label>
                          <Input
                            id={`evi-${c.id}`}
                            type="file"
                            onChange={(e) => updateEvidence(c.id, e.target.files?.[0] ?? null)}
                            className="text-sm w-56 h-9"
                          />
                          {c.evidence ? (
                            <Button size="sm" variant="secondary" asChild>
                              <a href={c.evidence} target="_blank" rel="noreferrer">
                                View
                              </a>
                            </Button>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Button size="sm" variant="secondary" onClick={saveDraft} disabled={!data || saving}>
              {saving ? "Saving…" : "Save Draft"}
            </Button>
            <Button size="sm" variant="primary" onClick={submitToAdmin} disabled={!data || submitting}>
              {submitting ? "Submitting…" : "Submit to Admin"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
