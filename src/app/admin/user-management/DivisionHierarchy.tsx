"use client";

import type { ComponentType } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Building2 } from "lucide-react";
import type { Branch, Division } from "./types";

interface DivisionHierarchyProps {
  divisions: Division[];
  branchesByDivision: Map<number, Branch[]>;
  userCountByBranch: Map<number, number>;
  EmptyState: ComponentType<{ message: string; compact?: boolean }>;
}

export function DivisionHierarchy({
  divisions,
  branchesByDivision,
  userCountByBranch,
  EmptyState,
}: DivisionHierarchyProps) {
  // ---------- Empty state ----------
  if (divisions.length === 0) {
    return (
      <EmptyState message="No divisions yet. Add your first division to build the hierarchy." />
    );
  }

  return (
    <div className="space-y-4">
      {divisions.map((division) => {
        const divisionBranches = branchesByDivision.get(division.id) ?? [];

        return (
          <Card key={division.id} className="border shadow-sm">
            <CardHeader className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="h-4 w-4 text-slate-500" />
                {division.name}
              </CardTitle>

              {division.description && (
                <p className="text-sm text-muted-foreground">{division.description}</p>
              )}
            </CardHeader>

            <CardContent>
              {divisionBranches.length === 0 ? (
                <EmptyState message="No branches linked to this division yet." compact />
              ) : (
                <ul className="space-y-2">
                  {divisionBranches.map((branch) => {
                    const branchUsers = userCountByBranch.get(branch.id) ?? 0;

                    return (
                      <li
                        key={branch.id}
                        className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-500" />

                          {/* ✅ Clean separator fix */}
                          <span>
                            {branch.name}
                            {branch.location ? ` - ${branch.location}` : ""}
                          </span>
                        </div>

                        <Badge
                          variant="outline"
                          className="bg-white text-xs font-medium"
                        >
                          {branchUsers} {branchUsers === 1 ? "user" : "users"}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
