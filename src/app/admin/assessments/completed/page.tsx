"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ---------- Unified types (no any, no overlap) ---------- */
type Outcome = "Pending" | "Approved" | "Rejected" | "ChangesRequested";

type ControlRow = {
  id: string;
  name: string;
  status: Outcome;           // staff-submitted status
  implementation?: string;
  gapDescription?: string;
  assignedTo?: string;
  evidence?: string;
  review?: Outcome;          // admin decision (if present)
  comments?: string;
  reviewDate?: string;       // ISO yyyy-mm-dd
};

type Assessment = {
  id: number;
  framework: string;
  division: string;
  date: string;              // ISO date string
  status: "Completed";
  controls: ControlRow[];
};

/* ---------- Demo data (until backend is wired) ---------- */
const DEMO: Assessment[] = [
  {
    id: 101,
    framework: "ISO 27001",
    division: "Finance",
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

/* ---------- Small helpers ---------- */
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

/* ---------- Page ---------- */
export default function CompletedAssessmentsPage() {
  const [items, setItems] = useState<Assessment[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [downloadingIndex] = useState<number | null>(null);

  useEffect(() => {
    // Replace with fetch(...) when your API is ready
    setItems(DEMO);
  }, []);

  const toggleExpand = (index: number) =>
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Completed Assessments</h2>
      <p className="text-sm text-gray-600">
        Completed assessment records are maintained here, categorized by framework and division.
      </p>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500 italic">No completed assessments available.</p>
          </CardContent>
        </Card>
      ) : (
        items.map((a, index) => (
          <Card key={`${a.id}-${index}`}>
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
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => alert("PDF Generation")}
                  disabled={downloadingIndex === index}
                >
                  {downloadingIndex === index ? "Generating…" : "Generate PDF Report"}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => toggleExpand(index)}>
                  {expanded[index] ? "Hide Controls" : "View Controls"}
                </Button>
              </div>

              {expanded[index] && (
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
                      {a.controls.map((c, cIndex) => {
                        // prefer admin review if present, otherwise staff status
                        const outcome: Outcome = c.review ?? c.status;
                        return (
                          <tr key={`${a.id}-${c.id}-${cIndex}`} className="border-b">
                            <td className="border p-2">{c.id}</td>
                            <td className="border p-2">{c.name}</td>
                            <td className="border p-2">
                              <OutcomeBadge value={outcome} />
                            </td>
                            <td className="border p-2">{c.implementation || "-"}</td>
                            <td className="border p-2">{c.gapDescription || "-"}</td>
                            <td className="border p-2">{c.assignedTo || "-"}</td>
                            <td className="border p-2">{c.evidence || "-"}</td>
                            <td className="border p-2">
                              <Label htmlFor={`comments-${a.id}-${c.id}`} className="sr-only">
                                Comments
                              </Label>
                              <Input
                                id={`comments-${a.id}-${c.id}`}
                                type="text"
                                value={c.comments || ""}
                                readOnly
                                className="mt-1"
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
    </div>
  );
}
