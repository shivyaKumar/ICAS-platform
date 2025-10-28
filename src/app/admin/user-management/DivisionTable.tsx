"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Division } from "./types";

interface DivisionTableProps {
  divisions: Division[];
  branchCounts: Map<number, number>;
  canManage: boolean;
  onEdit: (division: Division) => void;
  onDelete: (id: number) => void;
}

export function DivisionTable({ divisions, branchCounts, canManage, onEdit, onDelete }: DivisionTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Branches</TableHead>
          <TableHead className="w-[120px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {divisions.map((division) => (
          <TableRow key={division.id}>
            <TableCell className="font-medium">{division.name}</TableCell>
            <TableCell>{division.description || "-"}</TableCell>
            <TableCell>{branchCounts.get(division.id) ?? 0}</TableCell>
            <TableCell className="text-right">
              {canManage ? (
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(division)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onDelete(division.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <span>-</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
