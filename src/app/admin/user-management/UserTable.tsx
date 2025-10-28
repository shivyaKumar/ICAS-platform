"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import type { Branch, Division, User } from "./types";

interface UserTableProps {
  users: User[];
  branchLookup: Map<number, Branch>;
  divisionLookup: Map<number, Division>;
  formatBranchLabel: (branch?: Branch | null) => string;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

export function UserTable({
  users,
  branchLookup,
  divisionLookup,
  formatBranchLabel,
  onEdit,
  onDelete,
}: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Division</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead className="w-[120px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const branch = branchLookup.get(user.branchId);
          const division =
            (branch && divisionLookup.get(branch.divisionId)?.name) ||
            divisionLookup.get(user.divisionId)?.name ||
            "-";

          return (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.firstName} {user.lastName}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant="secondary">{user.role}</Badge>
              </TableCell>
              <TableCell>{division}</TableCell>
              <TableCell>{formatBranchLabel(branch)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onDelete(user.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
