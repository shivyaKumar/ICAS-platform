"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AssessmentTable, { type UserOption } from "@/components/assessments/AssessmentTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { Assessment, Evidence, Finding } from "@/types/assessment";

/* ----------------- Utility Helpers ----------------- */
function normalize(value?: string | null): string {
  return value ? value.trim().toLowerCase() : "";
}

function composeFullName(
  first?: string | null,
  last?: string | null,
  email?: string | null,
  fallback = ""
): string {
  const parts: string[] = [];
  if (first && first.trim()) parts.push(first.trim());
  if (last && last.trim()) parts.push(last.trim());
  if (parts.length) return parts.join(" ");
  if (email && email.trim()) return email.trim();
  return fallback;
}

function toEvidenceList(value: unknown): Evidence[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      return {
        id: typeof record.id === "number" ? record.id : 0,
        fileName: typeof record.fileName === "string" ? record.fileName : null,
        fileUrl: typeof record.fileUrl === "string" ? record.fileUrl : null,
        description:
          typeof record.description === "string" ? record.description : null,
        uploadedBy:
          typeof record.uploadedBy === "string" ? record.uploadedBy : null,
        uploadedAt:
          typeof record.uploadedAt === "string" ? record.uploadedAt : null,
      } as Evidence;
    })
    .filter(Boolean) as Evidence[];
}

function mapFinding(raw: unknown): Finding {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const id = Number(source.id) || 0;

  const getString = (key: string): string | undefined =>
    typeof source[key] === "string" ? (source[key] as string) : undefined;

  const getNullableString = (key: string): string | null =>
    typeof source[key] === "string" ? (source[key] as string) : null;

  return {
    id,
    code:
      typeof source.code === "string" && source.code.trim().length > 0
        ? source.code.trim()
        : `AF-${id || 0}`,
    title: getString("title"),
    description: getString("description"),
    domain: getString("domain"),
    status: getString("status"),
    compliance: getString("compliance"),
    evidenceRequired:
      typeof source.evidenceRequired === "boolean"
        ? (source.evidenceRequired as boolean)
        : undefined,
    evidenceNote: getNullableString("evidenceNote"),
    notes: getNullableString("notes"),
    reviewerComment:
      getNullableString("reviewerComment") ?? getNullableString("comments"),
    review: getString("review"),
    assignedTo:
      getString("assignedTo") ??
      getString("assignedAdmin") ??
      getString("assignedUser"),
    assignedToUserId:
      getString("assignedToUserId") ??
      getString("assignedUserId") ??
      undefined,
    createdBy: getString("createdBy"),
    modifiedDate: getString("modifiedDate") ?? getString("updatedAt"),
    latestEvidenceLabel:
      getString("latestEvidenceLabel") ?? getString("evidenceFile"),
    latestEvidenceUrl: getString("latestEvidenceUrl"),
    latestEvidenceDescription: getString("latestEvidenceDescription"),
    latestEvidenceUploadedBy: getString("latestEvidenceUploadedBy"),
    latestEvidenceUploadedAt: getString("latestEvidenceUploadedAt"),
    evidences: toEvidenceList(
      (source.evidences as unknown) ?? (source.Evidences as unknown)
    ),
  } as Finding;
}

/* ----------------- Fetch Current User ----------------- */
async function fetchUser(): Promise<{
  id?: string;
  role?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}> {
  try {
    const res = await fetch("/api/me", { credentials: "include", cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    if (Array.isArray(data)) {
      const result: any = {};
      for (const claim of data) {
        if (claim.type?.includes("identity/claims/role")) result.role = claim.value;
        if (claim.type?.includes("nameidentifier")) result.id = claim.value;
        if (claim.type?.includes("email")) result.email = claim.value;
        if (claim.type?.includes("givenname")) result.firstName = claim.value;
        if (claim.type?.includes("surname")) result.lastName = claim.value;
      }
      return result;
    }

    return data;
  } catch (err) {
    console.error("Failed to fetch user info:", err);
    return {};
  }
}

/* ----------------- Main Component ----------------- */
export default function AssessmentDetailClient() {
  const params = useParams<{ id: string }>();
  const numericId = useMemo(() => {
    const raw = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : NaN;
  }, [params]);

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [assignableUsers, setAssignableUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssessment = useCallback(async () => {
    console.log("Reloading assessment from server...");
    if (!Number.isFinite(numericId)) {
      setError("Invalid assessment ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const me = await fetchUser();
      const userId = me.id ?? "";

      const detailPath = userId
        ? `/api/assessments/${numericId}?userId=${encodeURIComponent(userId)}`
        : `/api/assessments/${numericId}`;

      const [detailRes, usersRes, branchesRes] = await Promise.all([
        fetch(detailPath, { credentials: "include", cache: "no-store" }),
        fetch("/api/users", { credentials: "include", cache: "no-store" }),
        fetch("/api/branches", { credentials: "include", cache: "no-store" }),
      ]);

      if (!detailRes.ok) throw new Error(await detailRes.text());
      if (!usersRes.ok) throw new Error(await usersRes.text());
      if (!branchesRes.ok) throw new Error(await branchesRes.text());

      const detailData = await detailRes.json();
      const usersData = await usersRes.json();
      const branches = await branchesRes.json();

      /* ------------------ Build Assignable User List ------------------ */
      const branchLookup = new Map<number, any>();
      branches.forEach((branch: any) => branchLookup.set(branch.id, branch));

      const targetBranch = normalize(detailData.branch);
      const targetDivision = normalize(detailData.division);
      const targetLocation = normalize(detailData.location);

      const candidates = (Array.isArray(usersData) ? usersData : [])
        .filter((user: any) => !!user.role)
        .filter((user: any) => {
          const branchInfo = user.branchId ? branchLookup.get(user.branchId) : undefined;
          const userBranch = normalize(user.branchName ?? branchInfo?.name);
          const userDivision = normalize(user.divisionName ?? branchInfo?.divisionName);
          const userLocation = normalize(branchInfo?.location);

          const branchMatches = !targetBranch || userBranch === targetBranch;
          const divisionMatches = !targetDivision || userDivision === targetDivision;
          const locationMatches = !targetLocation || userLocation === targetLocation;
          return branchMatches && divisionMatches && locationMatches;
        })
        .map((user: any) => ({
          id: String(user.id),
          fullName: composeFullName(
            user.firstName,
            user.lastName,
            user.email,
            user.email ?? String(user.id)
          ),
          email: user.email,
          role: user.role,
        }));

      const assignableMap = new Map<string, UserOption>();
      candidates.forEach((user) => assignableMap.set(user.id, user));

      const findingsRaw = Array.isArray(detailData.findings)
        ? detailData.findings
        : [];
      findingsRaw.forEach((item: any) => {
        const assignedId = item.assignedToUserId;
        const assignedName = item.assignedTo;
        if (typeof assignedId === "string" && !assignableMap.has(assignedId)) {
          assignableMap.set(assignedId, {
            id: assignedId,
            fullName:
              typeof assignedName === "string" ? assignedName : assignedId,
          });
        }
      });

      const sortedAssignable = Array.from(assignableMap.values()).sort((a, b) =>
        (a.fullName || a.email || a.id).localeCompare(
          b.fullName || b.email || b.id
        )
      );

      const sanitized: Assessment = {
        id: numericId,
        framework: detailData.framework ?? "",
        division: detailData.division,
        branch: detailData.branch,
        location: detailData.location,
        status: detailData.status,
        createdBy: detailData.createdBy,
        createdAt: detailData.createdAt ?? new Date().toISOString(),
        modifiedDate: detailData.modifiedDate,
        findings: findingsRaw.map(mapFinding),
      } as Assessment;

      setAssignableUsers(sortedAssignable);
      setAssessment(sanitized);
    } catch (err) {
      console.error("Assessment detail load failed:", err);
      setError(err instanceof Error ? err.message : "Unable to load assessment.");
    } finally {
      setLoading(false);
    }
  }, [numericId]);

  useEffect(() => {
    loadAssessment();
  }, [loadAssessment]);

  if (loading)
    return (
      <p className="mt-8 text-center text-muted-foreground">
        Loading assessment…
      </p>
    );

  if (error || !assessment)
    return (
      <p className="mt-8 text-center text-red-600">
        {error ?? "Failed to load assessment details."}
      </p>
    );

  /* ------------------ Render ------------------ */
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-xl font-semibold">
            <span>{assessment.framework}</span>
            {assessment.branch && <Badge variant="secondary">{assessment.branch}</Badge>}
            {assessment.division && <Badge variant="outline">{assessment.division}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground">
          {assessment.location && (
            <span>
              <strong className="text-foreground">Location:</strong>{" "}
              {assessment.location}
            </span>
          )}
          <span>
            <strong className="text-foreground">Created By:</strong>{" "}
            {assessment.createdBy ?? "Unknown"}
          </span>
          <span>
            <strong className="text-foreground">Created At:</strong>{" "}
            {new Date(assessment.createdAt).toLocaleString()}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Control Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <AssessmentTable
            findings={assessment.findings ?? []}
            assignableUsers={assignableUsers}
            onRefresh={loadAssessment}
          />
        </CardContent>
      </Card>
    </div>
  );
}
