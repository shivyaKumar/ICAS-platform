"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Branch, Division } from "./types";

interface BranchTableProps {
  branches: Branch[];
  divisionLookup: Map<number, Division>;
  userCountByBranch: Map<number, number>;
  canManage: boolean;
  onEdit: (branch: Branch) => void;
  onDelete: (id: number) => void;
}

export function BranchTable({
  branches,
  divisionLookup,
  userCountByBranch,
  canManage,
  onEdit,
  onDelete,
}: BranchTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Division</TableHead>
          <TableHead>Users</TableHead>
          <TableHead className="w-[120px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {branches.map((branch) => {
          const division = divisionLookup.get(branch.divisionId);
          const userCount = userCountByBranch.get(branch.id) ?? 0;

          return (
            <TableRow key={branch.id}>
              <TableCell className="font-medium">{branch.name}</TableCell>
              <TableCell>{branch.location || "-"}</TableCell>
              <TableCell>{division?.name || "-"}</TableCell>
              <TableCell>{userCount}</TableCell>
              <TableCell className="text-right">
                {canManage ? (
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" onClick={() => onEdit(branch)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(branch.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <span>-</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
