"use client";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import React, { useState, useRef, useEffect } from "react";
import { Finding } from "@/types/assessment";
import EvidenceDrawer from "@/components/assessments/EvidenceDrawer";
import CommentSection from "@/components/assessments/CommentSection";
import { formatAppDate } from "@/lib/date";

interface AssessmentTableProps {
  findings: Finding[];
  assignableUsers?: UserOption[];
  onRefresh?: () => Promise<void> | void;
  userRole?: string;
  isCompleted?: boolean;
}

export type UserOption = {
  id: string;
  fullName?: string | null;
  email?: string | null;
  role?: string | null;
};

export default function AssessmentTable({
  findings,
  assignableUsers = [],
  onRefresh,
  userRole = "",
  isCompleted = false,
}: AssessmentTableProps) {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [localFindings, setLocalFindings] = useState<Finding[]>(findings);
  const descriptionRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const normalizeRole = (value?: string) =>
    value?.toLowerCase().replace(/[\s_-]+/g, "") ?? "";
  const canEdit = ["itadmin", "superadmin"].includes(normalizeRole(userRole));

  useEffect(() => setLocalFindings(findings), [findings]);

  const toggleExpand = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleChange = async (id: number, field: string, value: string) => {
    try {
      setLocalFindings((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, [field]: value, modifiedDate: new Date().toISOString() }
            : f
        )
      );

      const endpoint =
        field === "review"
          ? `/api/assessments/review-finding/${id}`
          : `/api/assessments/update-finding/${id}`;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error(await res.text());
      await onRefresh?.();
    } catch (err) {
      console.error("Update failed:", err);
      await onRefresh?.();
    }
  };

  if (!localFindings?.length)
    return (
      <p className="text-gray-500 text-center p-4">
        No control findings available.
      </p>
    );

  return (
    <div className="overflow-x-auto bg-white border border-gray-300 rounded-md shadow-sm">
      <Table className="w-full text-[13px] min-w-[1800px] border-collapse">
        {/* ---------- Header ---------- */}
        <TableHeader>
          <TableRow className="bg-blue-100 border-b border-gray-300">
            {[
              "Code",
              "Title",
              "Description",
              "Domain",
              "Status",
              "Compliance",
              "Evidence",
              "Review",
              "Comments",
              "Assigned To",
              "Priority",
              "Created By",
              "Modified",
            ].map((header) => (
              <TableHead
                key={header}
                className="text-blue-900 font-semibold text-xs uppercase tracking-wide py-2.5 px-4 border-r border-gray-300 text-left"
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        {/* ---------- Body ---------- */}
        <TableBody>
          {localFindings.map((f, index) => {
            const expanded = expandedRows.includes(f.id);
            const rowBg = index % 2 === 0 ? "bg-white" : "bg-blue-50";

            return (
              <TableRow
                key={f.id}
                className={`${rowBg} border-b border-gray-300 hover:bg-gray-100 transition-colors`}
                style={{ height: "70px" }}
              >
                {/* ---------- Code ---------- */}
                <TableCell className="px-4 py-3 border-r border-gray-200 text-gray-800">
                  {f.code || "—"}
                </TableCell>

                {/* ---------- Title ---------- */}
                <TableCell className="px-4 py-3 border-r border-gray-200 font-medium text-gray-900 max-w-[260px] relative leading-snug">
                  <div
                    className={`whitespace-pre-wrap break-words ${
                      expandedRows.includes(f.id) ? "" : "line-clamp-3"
                    }`}
                  >
                    {f.title || "—"}
                  </div>

                  {/* Show Read More only for longer titles */}
                  {f.title && f.title.trim().length > 50 && (
                    <button
                      onClick={() => toggleExpand(f.id)}
                      className="absolute bottom-1 right-2 text-blue-600 text-xs font-medium hover:underline bg-white px-1"
                    >
                      {expandedRows.includes(f.id) ? "Show less" : "Read more"}
                    </button>
                  )}
                </TableCell>

                {/* ---------- Description ---------- */}
                <TableCell className="px-4 py-3 border-r border-gray-200 text-gray-700 max-w-[400px] relative leading-snug">
                  <div
                    ref={(el) => {
                      if (el) descriptionRefs.current.set(f.id, el);
                      else descriptionRefs.current.delete(f.id);
                    }}
                    className={`whitespace-pre-wrap break-words ${
                      expanded ? "" : "line-clamp-3"
                    }`}
                  >
                    {f.description || "—"}
                  </div>
                  {f.description && f.description.length > 120 && (
                    <button
                      onClick={() => toggleExpand(f.id)}
                      className="absolute bottom-1 right-2 text-blue-600 text-xs font-medium hover:underline bg-white px-1"
                    >
                      {expanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </TableCell>

                {/* ---------- Domain ---------- */}
                <TableCell className="px-4 py-3 border-r border-gray-200 text-gray-700 whitespace-pre-wrap break-words leading-snug">
                  {f.domain || "—"}
                </TableCell>

                {/* ---------- Status ---------- */}
                <TableCell className="px-4 py-3 border-r border-gray-200 text-center">
                  {f.status ? (
                    <span
                      className={`px-2 py-1 rounded text-[12px] font-semibold ${
                        f.status.toLowerCase() === "approved"
                          ? "bg-green-100 text-green-700"
                          : f.status.toLowerCase() === "rejected"
                          ? "bg-red-100 text-red-700"
                          : f.status.toLowerCase() === "in progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {f.status}
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>

                {/* ---------- Compliance ---------- */}
                <TableCell className="px-4 py-3 border-r border-gray-200 text-center">
                  {canEdit && !isCompleted ? (
                    <select
                      className="border border-gray-300 rounded-md w-[160px] text-center p-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-300"
                      value={f.compliance || ""}
                      onChange={(e) =>
                        handleChange(f.id, "compliance", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Partially">Partially</option>
                    </select>
                  ) : (
                    <span className="text-gray-700">{f.compliance || "N/A"}</span>
                  )}
                </TableCell>

                {/* ---------- Evidence ---------- */}
                <TableCell className="px-4 py-3 border-r border-gray-200 align-top text-sm">
                  {f.evidences?.length ? (
                    <>
                      <a
                        href={`/api/evidence/download/${f.evidences[0].id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline block truncate max-w-[220px]"
                      >
                        {decodeURIComponent(
                          f.evidences[0].fileUrl
                            ?.split("/")
                            .pop()
                            ?.replace(
                              /^[0-9a-fA-F\-]{36}[_-]?/,
                              ""
                            )
                            ?.replace(/\?.*$/, "")
                            ?.trim() || "Evidence File"
                        )}
                      </a>


                      {f.evidences.length > 1 && (
                        <button
                          onClick={() => {
                            document
                              .querySelector(
                                `[data-evidence-drawer='${f.id}'] button`
                              )
                              ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
                          }}
                          className="text-xs text-blue-600 hover:underline cursor-pointer mt-0.5"
                        >
                          +{f.evidences.length - 1} more
                        </button>
                      )}

                      <div data-evidence-drawer={f.id}>
                        <EvidenceDrawer
                          findingId={f.id}
                          onUploadSuccess={onRefresh}
                          isCompleted={isCompleted}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-400 text-xs">No files</p>
                      <EvidenceDrawer
                        findingId={f.id}
                        onUploadSuccess={onRefresh}
                        isCompleted={isCompleted}
                      />
                    </>
                  )}
                </TableCell>

                {/* ---------- Review ---------- */}
                <TableCell className="px-4 py-3 border-r border-gray-200 text-center">
                  {canEdit && !isCompleted ? (
                    <select
                      className="border border-gray-300 rounded-md w-[160px] text-center p-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-300"
                      value={f.review || ""}
                      onChange={(e) =>
                        handleChange(f.id, "review", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  ) : (
                    <span
                      className={`font-semibold text-sm ${
                        f.review === "Approved"
                          ? "text-green-600"
                          : f.review === "Rejected"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {f.review || "Pending"}
                    </span>
                  )}
                </TableCell>

                {/* ---------- Comments ---------- */}
                <TableCell className="px-4 py-3 border-r border-gray-200 text-xs align-top text-blue-700">
                  {f.commentsThread?.length ? (
                    <>
                      <span className="truncate block max-w-[230px] font-medium">
                        {f.commentsThread[f.commentsThread.length - 1].text}
                      </span>
                      {f.commentsThread.length > 1 && (
                        <button
                          onClick={() => {
                            document
                              .querySelector(
                                `[data-comment-drawer='${f.id}'] button`
                              )
                              ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
                          }}
                          className="text-xs text-blue-500 hover:underline cursor-pointer mt-0.5"
                        >
                          +{f.commentsThread.length - 1} more
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400 italic">No comments</span>
                  )}

                  <div data-comment-drawer={f.id}>
                    <CommentSection
                      findingId={f.id}
                      onRefresh={onRefresh}
                      isCompleted={isCompleted}
                    />
                  </div>
                </TableCell>

                {/* ---------- Assigned To ---------- */}
                <TableCell className="px-4 py-3 border-r border-gray-200 text-center">
                  <select
                    disabled={isCompleted}
                    className="border border-gray-300 rounded-md w-[200px] text-center p-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-300"
                    value={f.assignedToEmail || f.assignedTo || ""}
                    onChange={(e) =>
                      handleChange(f.id, "assignedTo", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {assignableUsers.map((u) => (
                      <option key={u.id} value={u.email ?? ""}>
                        {u.fullName ?? u.email ?? "Unnamed"}
                      </option>
                    ))}
                  </select>
                </TableCell>

                {/* ---------- Priority ---------- */}
                <TableCell className="px-4 py-3 border-r border-gray-200 text-center">
                  {!isCompleted &&
                  ["itadmin", "superadmin", "admin"].includes(
                    userRole?.toLowerCase().replace(/\s+/g, "")
                  ) ? (
                    <select
                      className={`border border-gray-300 rounded-md w-[140px] text-center p-1.5 text-sm font-medium
                        focus:ring-2 focus:ring-blue-300
                        ${
                          f.priority?.toLowerCase() === "high"
                            ? "bg-red-100 text-red-800"
                            : f.priority?.toLowerCase() === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : f.priority?.toLowerCase() === "low"
                            ? "bg-green-100 text-green-800"
                            : "bg-white text-gray-700"
                        }`}
                      value={f.priority || ""}
                      onChange={(e) => handleChange(f.id, "priority", e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-[12px] font-semibold inline-block
                        ${
                          f.priority?.toLowerCase() === "high"
                            ? "bg-red-100 text-red-700"
                            : f.priority?.toLowerCase() === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : f.priority?.toLowerCase() === "low"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {f.priority || "—"}
                    </span>
                  )}
                </TableCell>

                {/* ---------- Created & Modified ---------- */}
                <TableCell className="px-4 py-3 border-r border-gray-200 text-gray-700 text-center">
                  {f.createdBy || "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 text-center">
                  {f.modifiedDate
                    ? formatAppDate(f.modifiedDate)
                    : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
