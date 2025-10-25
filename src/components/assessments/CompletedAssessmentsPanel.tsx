"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

export default function CompletedAssessmentsPanel({
  basePath = "/admin/assessments/completed",
}: {
  basePath?: string;
}) {
  const [items, setItems] = useState<CompletedAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/assessments/completed", { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (cancelled) return;
        setItems(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setError("Failed to load completed assessments");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const content = useMemo(() => {
    if (loading) return <p className="text-gray-500 text-sm text-center py-12">Loading…</p>;
    if (error) return <p className="text-red-600 text-sm text-center py-12">{error}</p>;
    if (!items.length) return <p className="text-gray-500 italic text-sm text-center py-12">No completed assessments found.</p>;

    return (
      <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
        <Table className="w-full text-sm">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Framework</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Closed By</TableHead>
              <TableHead>Closed At</TableHead>
              <TableHead className="text-center">Progress</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.framework}</TableCell>
                <TableCell>{a.division}</TableCell>
                <TableCell>{a.branch}</TableCell>
                <TableCell>{a.location}</TableCell>
                <TableCell>{a.closedBy}</TableCell>
                <TableCell>{a.closedAt}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">{a.progressRate ?? "—"}%</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`${basePath}/${a.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }, [items, loading, error, basePath]);

  return <div className="space-y-6">{content}</div>;
}
