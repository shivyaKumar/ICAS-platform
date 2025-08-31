"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ControlRow = {
  id: string;
  name: string;
  status: "Pending" | "Approved" | "Rejected";
  implementation?: string;
  gapDescription?: string;
  assignedTo?: string;
  evidence?: string;
  review?: string;
  comments?: string;
  reviewDate?: string;
};

type Assessment = {
  id: number;
  framework: string;
  division: string;
  date: string; // ISO
  status: "Completed";
  controls: ControlRow[];
};

export default function CompletedAssessmentsPage() {
  const [items, setItems] = useState<Assessment[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE?.trim();

  useEffect(() => {
    // Load from localStorage (written by Current page when admin marks completed)
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem("completed_assessments")
        : null;
    const data: Assessment[] = raw ? JSON.parse(raw) : [];
    setItems(data);
  }, []);

  const toggleExpand = (id: number) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // Generate PDF Report
  async function handleReport(assessmentId: number) {
    if (!apiBase) {
      alert(
        "Report generation requires the backend API. Set NEXT_PUBLIC_API_BASE in .env.local."
      );
      return;
    }
    try {
      setDownloadingId(assessmentId);
      const url = `${apiBase}/api/assessments/${assessmentId}/report?format=pdf`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error("Failed to generate report");
      const blob = await res.blob();

      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `assessment_${assessmentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Completed Assessments</h2>
      <p className="text-sm text-muted-foreground">
        Assessments that were marked completed by the admin.
      </p>

      {items.length === 0 ? (
        <Card className="shadow-md border rounded-lg p-6">
          <p className="text-gray-500 italic">
            No completed assessments available.
          </p>
        </Card>
      ) : (
        items.map((a) => (
          <Card key={a.id} className="shadow-md border rounded-lg">
            <CardHeader className="flex flex-col gap-1">
              <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                <span>
                  {a.framework} — {a.division}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="primary">Completed</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(a.date).toLocaleDateString()}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Only one button: PDF */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleReport(a.id)}
                  disabled={downloadingId === a.id}
                >
                  {downloadingId === a.id
                    ? "Generating…"
                    : "Generate PDF Report"}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => toggleExpand(a.id)}
                >
                  {expanded[a.id] ? "Hide Controls" : "View Controls"}
                </Button>
              </div>

              {expanded[a.id] && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border text-sm min-w-[900px]">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="border p-2 text-left">ID</th>
                        <th className="border p-2 text-left">Control</th>
                        <th className="border p-2 text-left">Status</th>
                        <th className="border p-2 text-left">Implementation</th>
                        <th className="border p-2 text-left">Gap Description</th>
                        <th className="border p-2 text-left">Assigned To</th>
                        <th className="border p-2 text-left">Evidence</th>
                        <th className="border p-2 text-left">Review</th>
                        <th className="border p-2 text-left">Comments</th>
                        <th className="border p-2 text-left">Review Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.controls.map((c) => (
                        <tr key={c.id} className="border-b">
                          <td className="border p-2">{c.id}</td>
                          <td className="border p-2">{c.name}</td>
                          <td className="border p-2">
                            {c.status === "Approved" && (
                              <Badge variant="primary">Approved</Badge>
                            )}
                            {c.status === "Rejected" && (
                              <Badge variant="destructive">Rejected</Badge>
                            )}
                            {c.status === "Pending" && (
                              <Badge variant="secondary">Pending</Badge>
                            )}
                          </td>
                          <td className="border p-2">
                            {c.implementation || "-"}
                          </td>
                          <td className="border p-2">
                            {c.gapDescription || "-"}
                          </td>
                          <td className="border p-2">{c.assignedTo || "-"}</td>
                          <td className="border p-2">{c.evidence || "-"}</td>
                          <td className="border p-2">{c.review || "-"}</td>
                          <td className="border p-2">{c.comments || "-"}</td>
                          <td className="border p-2">{c.reviewDate || "-"}</td>
                        </tr>
                      ))}
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
