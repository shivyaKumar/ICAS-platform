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
import { Input } from "@/components/ui/input";
import React, { useState, useRef, useEffect } from "react";
import { Finding } from "@/types/assessment"; // ✅ Shared backend-aligned type

interface AssessmentTableProps {
  findings: Finding[];
  mode?: "readonly" | "review";
  onUpdate?: (id: number, field: string, value: string) => void;
}

/* ---------- Component ---------- */
export default function AssessmentTable({
  findings,
  mode = "readonly",
  onUpdate,
}: AssessmentTableProps) {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [longRows, setLongRows] = useState<number[]>([]);
  const descriptionRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const toggleExpand = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleChange = (id: number, field: string, value: string) => {
    onUpdate?.(id, field, value);
  };

  // Detect long description text
  useEffect(() => {
    const newLongRows: number[] = [];
    descriptionRefs.current.forEach((el, id) => {
      if (el && el.scrollHeight > 85) newLongRows.push(id);
    });
    setLongRows(newLongRows);
  }, [findings]);

  if (!findings?.length)
    return (
      <p className="text-gray-500 text-center p-4">
        No control findings available.
      </p>
    );

  return (
    <div className="overflow-x-auto bg-white border rounded-lg shadow">
      <Table className="w-full border-collapse text-sm min-w-[1200px]">
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

                {/* ---------- Description Cell ---------- */}
                <TableCell className="max-w-[420px] text-gray-800 text-sm relative">
                  <div
                    ref={(el) => {
                      if (el) descriptionRefs.current.set(f.id, el);
                    }}
                    className={`whitespace-pre-wrap break-words transition-all duration-300 pr-8 ${
                      expanded
                        ? "max-h-none"
                        : "max-h-[85px] overflow-hidden relative"
                    }`}
                    style={{ lineHeight: "1.4rem" }}
                  >
                    {f.description || "—"}
                    {!expanded && isLong && (
                      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
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
                  <Badge variant="secondary">{f.status}</Badge>
                </TableCell>

                {/* ---------- Compliance ---------- */}
                <TableCell>
                  {mode === "review" ? (
                    <select
                      className="border p-1 rounded w-full"
                      value={f.compliance}
                      onChange={(e) =>
                        handleChange(f.id, "compliance", e.target.value)
                      }
                    >
                      <option value="">-- Select --</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Partially">Partially</option>
                    </select>
                  ) : (
                    f.compliance || "—"
                  )}
                </TableCell>

                {/* ---------- Evidence Section ---------- */}
                <TableCell>
                  {f.evidences?.length ? (
                    <ul className="list-disc ml-4">
                      {f.evidences.map((ev, i) => (
                        <li key={i}>
                          <a
                            href={ev.fileUrl}
                            target="_blank"
                            className="text-blue-600 underline"
                          >
                            {ev.fileName}
                          </a>{" "}
                          <span className="text-xs text-gray-500">
                            ({new Date(ev.uploadedAt).toLocaleDateString()})
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-500">No files</span>
                  )}
                </TableCell>

                {/* ---------- Review ---------- */}
                <TableCell>
                  {mode === "review" ? (
                    <select
                      className="border p-1 rounded w-full"
                      value={f.review || ""}
                      onChange={(e) =>
                        handleChange(f.id, "review", e.target.value)
                      }
                    >
                      <option value="">-- Select --</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  ) : (
                    f.review || "—"
                  )}
                </TableCell>

                {/* ---------- Comments ---------- */}
                <TableCell>
                  <Input
                    placeholder="Add comments"
                    value={f.comments || ""}
                    onChange={(e) =>
                      handleChange(f.id, "comments", e.target.value)
                    }
                  />
                </TableCell>

                <TableCell>{f.assignedTo || "Unassigned"}</TableCell>
                <TableCell>{f.createdBy || "—"}</TableCell>
                <TableCell>
                  {f.modifiedDate
                    ? new Date(f.modifiedDate).toLocaleString()
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
