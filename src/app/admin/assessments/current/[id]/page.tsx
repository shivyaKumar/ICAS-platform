"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* Types */
type ReviewDecision = "" | "Approved" | "ChangesRequested" | "Rejected";
type ComplianceStatus = "Pending" | "Compliant" | "NonCompliant";
type AssessmentStatus = "Submitted" | "ChangesRequested" | "Completed" | "Active";
type Control = {
  id: string; name: string; status: ComplianceStatus; implementation: string;
  gapDescription: string; assignedTo: string; evidence: string;
  review: ReviewDecision; comments: string; reviewDate: string;
};
type Assessment = { id: number; framework: string; division: string; date: string; status: AssessmentStatus; controls: Control[]; };
type CompletedAssessment = Omit<Assessment, "status"> & { status: "Completed" };
type EditableField = "review" | "comments" | "reviewDate";

/* storage keys + utils */
const LS_CURRENT = "current_assessments";
const LS_COMPLETED = "completed_assessments";
function readLS<T>(k: string, fallback: T): T { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) as T : fallback; } catch { return fallback; } }
function writeLS<T>(k: string, v: T) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

/* component */
export default function AdminCurrentDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = useMemo(() => Number(params.id), [params.id]);

  const [assessment, setAssessment] = useState<Assessment | null>(null);

  // load one from API or LS
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // API first
      try {
        const res = await fetch(`/api/assessments/${id}`, { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as Assessment;
          if (!cancelled) setAssessment(data);
          return;
        }
      } catch { /* ignore */ }

      // Fallback LS
      const all = readLS<Assessment[]>(LS_CURRENT, []);
      const found = all.find(a => a.id === id) || null;
      if (!cancelled) setAssessment(found);
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleUpdate = (ctrlId: string, field: EditableField, value: string) => {
    setAssessment(prev => {
      if (!prev) return prev;
      const next: Assessment = {
        ...prev,
        controls: prev.controls.map(c => c.id === ctrlId ? { ...c, [field]: value } : c),
      };
      // sync LS copy
      const all = readLS<Assessment[]>(LS_CURRENT, []);
      const idx = all.findIndex(a => a.id === next.id);
      if (idx >= 0) { all[idx] = next; writeLS(LS_CURRENT, all); }
      return next;
    });
  };

  const handleSaveReview = () => {
    if (!assessment) return;
    console.log("Saving review:", assessment);
    alert("Review saved.");
    // TODO: PUT /admin/assessments/:id/review
  };

  const handleRequestChanges = () => {
    if (!assessment) return;
    const needs = assessment.controls.some(c => c.review === "ChangesRequested" || c.review === "Rejected");
    if (!needs) { alert("Mark at least one control as 'Changes Requested' or 'Rejected'."); return; }
    alert("Changes requested and sent to staff.");
    // TODO: PATCH /admin/assessments/:id/request-changes
  };

  const handleMarkCompleted = () => {
    if (!assessment) return;
    const allApproved = assessment.controls.every(c => c.review === "Approved");
    if (!allApproved) { alert("All controls must be Approved before completing."); return; }

    const completed: CompletedAssessment = { ...assessment, status: "Completed" };
    // move from current -> completed in LS
    const current = readLS<Assessment[]>(LS_CURRENT, []).filter(a => a.id !== assessment.id);
    writeLS(LS_CURRENT, current);
    const completedAll = [completed, ...readLS<CompletedAssessment[]>(LS_COMPLETED, [])];
    writeLS(LS_COMPLETED, completedAll);

    alert("Marked as Completed.");
    router.push("/admin/assessments/completed"); // or back to list
  };

  if (!assessment) {
    return (
      <div className="p-6">
        <Button variant="secondary" onClick={() => router.back()}>← Back</Button>
        <div className="mt-6 text-gray-600">Assessment not found.</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => router.back()}>← Back</Button>
        <h2 className="text-2xl font-bold text-gray-900">
          {assessment.framework} — {assessment.division} <span className="text-gray-500">({assessment.date})</span>
        </h2>
      </div>
      <p className="text-sm text-gray-600">
        Review controls submitted by divisions. Approve what’s correct, or request changes/reject specific controls.
      </p>

      <div className="overflow-x-auto bg-white border rounded-lg shadow">
        <table className="w-full border-collapse border text-sm min-w-[1000px]">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Control</th>
              <th className="border p-2">Compliance Status</th>
              <th className="border p-2">Implementation</th>
              <th className="border p-2">Gap Description</th>
              <th className="border p-2">Assigned To</th>
              <th className="border p-2">Evidence</th>
              <th className="border p-2">Review</th>
              <th className="border p-2">Comments</th>
              <th className="border p-2">Review Date</th>
            </tr>
          </thead>
          <tbody>
            {assessment.controls.map((ctrl) => (
              <tr key={ctrl.id} className="border-b">
                <td className="border p-2">{ctrl.id}</td>
                <td className="border p-2">{ctrl.name}</td>
                <td className="border p-2"><Badge variant="secondary">{ctrl.status}</Badge></td>
                <td className="border p-2">{ctrl.implementation}</td>
                <td className="border p-2">{ctrl.gapDescription}</td>
                <td className="border p-2">{ctrl.assignedTo}</td>
                <td className="border p-2 text-blue-600 underline cursor-pointer">{ctrl.evidence}</td>
                <td className="border p-2">
                  <Label htmlFor={`review-${ctrl.id}`} className="sr-only">Review</Label>
                  <select
                    id={`review-${ctrl.id}`}
                    value={ctrl.review}
                    onChange={(e) => handleUpdate(ctrl.id, "review", e.target.value)}
                    className="border p-1 rounded"
                  >
                    <option value="">-- Select --</option>
                    <option value="Approved">Approved</option>
                    <option value="ChangesRequested">Changes Requested</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td className="border p-2">
                  <Input
                    id={`comments-${ctrl.id}`}
                    value={ctrl.comments}
                    onChange={(e) => handleUpdate(ctrl.id, "comments", e.target.value)}
                    placeholder="Add comments"
                  />
                </td>
                <td className="border p-2">
                  <Input
                    id={`date-${ctrl.id}`}
                    type="date"
                    value={ctrl.reviewDate}
                    onChange={(e) => handleUpdate(ctrl.id, "reviewDate", e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4">
        <Button variant="secondary" onClick={handleSaveReview}>Save Review</Button>
        <Button variant="primary" onClick={handleRequestChanges}>Request Changes</Button>
        <Button variant="primary" onClick={handleMarkCompleted}>Mark as Completed</Button>
      </div>
    </div>
  );
}
