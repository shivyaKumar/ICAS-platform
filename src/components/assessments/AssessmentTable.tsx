"use client";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
//import { Input } from "@/components/ui/input";
import React, { useState, useRef, useEffect } from "react";
import { Finding } from "@/types/assessment";
import EvidenceDrawer from "@/components/assessments/EvidenceDrawer";
import CommentSection from "@/components/assessments/CommentSection";



interface AssessmentTableProps {
  findings: Finding[];
  assignableUsers?: UserOption[];
  onRefresh?: () => void;
}
// ---------- Shared Type for Assignable Users ----------
export type UserOption = {
  id: string;
  fullName?: string | null;
  email?: string | null;
  role?: string | null;
};

/* ---------------- MAIN COMPONENT ---------------- */
export default function AssessmentTable({
  findings,
  assignableUsers = [],
  onRefresh,
}: AssessmentTableProps) {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [longRows, setLongRows] = useState<number[]>([]);
  const descriptionRefs = useRef<Map<number, HTMLDivElement>>(new Map());


  const toggleExpand = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleChange = async (id: number, field: string, value: string) => {
    try {
      const endpoint =
        field === "review"
          ? `/api/assessments/review-finding/${id}`
          : `/api/assessments/update-finding/${id}`;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) console.error(await res.text());
      else onRefresh?.();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };


  useEffect(() => {
    const newLongRows: number[] = [];
    descriptionRefs.current.forEach((el, id) => {
      if (el && el.scrollHeight > 85) newLongRows.push(id);
    });
    setLongRows(newLongRows);
  }, [findings]);

  if (!findings?.length)
    return <p className="text-gray-500 text-center p-4">No control findings available.</p>;

  return (
    <div className="overflow-x-auto bg-white border rounded-lg shadow">
      <Table className="w-full border-collapse text-sm min-w-[1800px]">
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Compliance</TableHead>
            <TableHead>Evidence</TableHead>
            <TableHead>Review</TableHead>
            <TableHead>Comments</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Modified</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {findings.map((f) => {
            const expanded = expandedRows.includes(f.id);
            const isLong = longRows.includes(f.id);

            return (
              <TableRow key={f.id} className="align-top">
                <TableCell>{f.code}</TableCell>
                <TableCell>{f.title}</TableCell>

                {/* ---------- Description ---------- */}
                <TableCell className="max-w-[420px] text-gray-800 relative">
                  <div
                    ref={(el) => {
                      if (el) descriptionRefs.current.set(f.id, el);
                      else descriptionRefs.current.delete(f.id);
                    }}
                    className={`whitespace-pre-wrap break-words transition-all pr-8 ${
                      expanded ? "max-h-none" : "max-h-[85px] overflow-hidden"
                    }`}
                  >
                    {f.description || "—"}
                    {!expanded && isLong && (
                      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent" />
                    )}
                  </div>
                  {isLong && (
                    <button
                      onClick={() => toggleExpand(f.id)}
                      className="absolute bottom-0 right-0 text-blue-600 text-xs font-medium bg-white px-1 hover:underline"
                    >
                      {expanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </TableCell>

                <TableCell>{f.domain}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{f.status || "—"}</Badge>
                </TableCell>

                {/* ---------- Compliance ---------- */}
                <TableCell>
                  <select
                    className="border p-1 rounded w-full bg-white"
                    value={f.compliance || ""}
                    onChange={(e) => handleChange(f.id, "compliance", e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Partially">Partially</option>
                  </select>
                </TableCell>

                {/* ---------- Evidence ---------- */}
                <TableCell className="align-top">
                  {f.evidences?.length ? (
                    <div className="flex flex-col gap-1">
                      {/* Display only clean filename (remove UUID prefix before underscore) */}
                      <a
                        href={f.evidences[0].fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm font-medium truncate max-w-[180px]"
                      >
                        {decodeURIComponent(
                          f.evidences[0].fileUrl
                            .split("/")
                            .pop()
                            ?.replace(/^[0-9a-fA-F-]{8}(-[0-9a-fA-F-]{4}){3}-[0-9a-fA-F-]{12}_/, "") || 
                            "Evidence File"
                        )}
                      </a>

                      {/* Clickable “+N more” that opens the Evidence Drawer */}
                      {f.evidences.length > 1 && (
                        <button
                          onClick={() => {
                            const btn = document.querySelector(
                              `#drawer-trigger-${f.id} button`
                            ) as HTMLButtonElement | null;
                            btn?.click();
                          }}
                          className="text-xs text-blue-500 hover:underline text-left"
                        >
                          +{f.evidences.length - 1} more
                        </button>
                      )}

                      {/* Hidden drawer trigger (identified by findingId) */}
                      <div id={`drawer-trigger-${f.id}`}>
                        <EvidenceDrawer findingId={f.id} onUploadSuccess={onRefresh} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 text-xs">No files</span>
                      <EvidenceDrawer findingId={f.id} onUploadSuccess={onRefresh} />
                    </div>
                  )}
                </TableCell>

                {/* ---------- Review ---------- */}
                <TableCell>
                  <select
                    className="border p-1 rounded w-full bg-white"
                    value={f.review || ""}
                    onChange={(e) => handleChange(f.id, "review", e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </TableCell>

                {/* ---------- Comments ---------- */}
                <TableCell className="align-top">
                  <div className="space-y-1 mb-2">
                    {f.commentsThread && f.commentsThread.length > 0 ? (
                      <>
                        {/* Show the latest comment */}
                        {f.commentsThread.slice(-1).map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-blue-50 border border-blue-200 rounded-md p-2 text-xs shadow-sm"
                          >
                            <p className="text-gray-900 leading-snug">{comment.text}</p>
                            <p className="text-[10px] text-gray-500 mt-1">
                              {comment.user} • {new Date(comment.createdAt).toLocaleString()}
                              {comment.updatedAt && (
                                <span className="italic text-gray-400 ml-1">(edited)</span>
                              )}
                            </p>
                          </div>
                        ))}

                        {/* “+N more” toggle (if multiple comments exist) */}
                        {f.commentsThread.length > 1 && (
                          <p
                            className="text-[11px] text-blue-600 hover:underline cursor-pointer mt-1"
                            onClick={() => {
                              const btn = document.querySelector(
                                `#comment-drawer-${f.id} button`
                              ) as HTMLButtonElement | null;
                              btn?.click();
                            }}
                          >
                            +{f.commentsThread.length - 1} more
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-[11px] text-gray-400 italic">No comments yet</p>
                    )}
                  </div>

                  {/* Hidden Comment Drawer Trigger */}
                  <div id={`comment-drawer-${f.id}`}>
                    <CommentSection findingId={f.id} onRefresh={onRefresh ?? (() => {})} />
                  </div>
                </TableCell>

                {/* ---------- Assigned To ---------- */}
                <TableCell>
                  <select
                    className="border p-1 rounded w-full bg-white"
                    value={f.assignedTo || ""}
                    onChange={(e) => handleChange(f.id, "assignedTo", e.target.value)}
                  >
                    <option value="">-- Assign To --</option>
                    {assignableUsers.map((u) => (
                      <option key={u.id} value={u.fullName ?? ""}>
                        {u.fullName ?? "Unnamed"}
                      </option>
                    ))}
                  </select>
                </TableCell>

                <TableCell>{f.createdBy || "—"}</TableCell>
                <TableCell>
                  {f.modifiedDate ? new Date(f.modifiedDate).toLocaleString() : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
    </div>
  );
}
