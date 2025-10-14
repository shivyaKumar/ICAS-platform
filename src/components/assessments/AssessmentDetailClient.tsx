"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import AssessmentTable, {
  type UserOption,
} from "@/components/assessments/AssessmentTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Assessment, Evidence, Finding } from "@/types/assessment";

const ASSIGNABLE_ROLES = new Set(["Admin", "Standard User"]);

function normalize(value?: string | null) {
  if (!value) return "";
  return value.trim().toLowerCase();
}

function composeFullName(
  first?: string | null,
  last?: string | null,
  email?: string | null,
  fallback = ""
) {
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
        id: typeof record.id === "number" ? record.id : undefined,
        fileName: typeof record.fileName === "string" ? record.fileName : null,
        fileUrl: typeof record.fileUrl === "string" ? record.fileUrl : null,
        description: typeof record.description === "string" ? record.description : null,
        uploadedBy: typeof record.uploadedBy === "string" ? record.uploadedBy : null,
        uploadedAt: typeof record.uploadedAt === "string" ? record.uploadedAt : null,
      } satisfies Evidence;
    })
    .filter(Boolean) as Evidence[];
}

function mapFinding(raw: unknown): Finding {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const idValue = source.id;
  const numericId =
    typeof idValue === "number"
      ? idValue
      : typeof idValue === "string"
      ? Number(idValue)
      : Number.NaN;
  const id = Number.isFinite(numericId) ? Number(numericId) : 0;

  const code =
    typeof source.code === "string" && source.code.trim().length > 0
      ? source.code.trim()
      : `AF-${id || 0}`;

  const getString = (key: string): string | undefined =>
    typeof source[key] === "string" ? (source[key] as string) : undefined;
  const getNullableString = (key: string): string | null =>
    typeof source[key] === "string" ? (source[key] as string) : null;

  const assignedTo =
    typeof source.assignedTo === "string"
      ? (source.assignedTo as string)
      : typeof source.assignedAdmin === "string"
      ? (source.assignedAdmin as string)
      : undefined;

  const assignedToUserId =
    typeof source.assignedToUserId === "string"
      ? (source.assignedToUserId as string)
      : typeof source.assignedUserId === "string"
      ? (source.assignedUserId as string)
      : undefined;

  return {
    id,
    code,
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
    assignedTo,
    assignedToUserId,
    createdBy: getString("createdBy"),
    modifiedDate: getString("modifiedDate") ?? getString("updatedAt"),
    latestEvidenceLabel:
      getString("latestEvidenceLabel") ?? getString("evidenceFile") ?? undefined,
    latestEvidenceUrl: getString("latestEvidenceUrl"),
    latestEvidenceDescription: getString("latestEvidenceDescription"),
    latestEvidenceUploadedBy: getString("latestEvidenceUploadedBy"),
    latestEvidenceUploadedAt: getString("latestEvidenceUploadedAt"),
    evidences: toEvidenceList((source.evidences as unknown) ?? (source.Evidences as unknown)),
  } as Finding;
}

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
  const [canModerate, setCanModerate] = useState(false);

  const loadAssessment = useCallback(async () => {
    if (!Number.isFinite(numericId)) {
      setError("Invalid assessment id supplied");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const meRes = await fetch("/api/me", { credentials: "include", cache: "no-store" });
      if (!meRes.ok) throw new Error(await meRes.text());
      const me = await meRes.json();

      const roles: string[] = Array.isArray(me?.roles)
        ? me.roles.filter((role: unknown): role is string => typeof role === "string")
        : typeof me?.role === "string"
        ? [me.role]
        : [];

      const userId: string | null =
        typeof me?.id === "string"
          ? me.id
          : typeof me?.userId === "string"
          ? me.userId
          : typeof me?.user?.id === "string"
          ? me.user.id
          : null;

      const isModerator = roles.includes("Super Admin") || roles.includes("IT Admin");
      setCanModerate(isModerator);

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

      const detailData = (await detailRes.json()) as Record<string, unknown>;
      const usersData = (await usersRes.json()) as Array<{
        id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        role?: string;
        branchId?: number;
        branchName?: string;
        divisionName?: string;
      }>;
      const branches = (await branchesRes.json()) as Array<{
        id: number;
        name: string;
        divisionName?: string | null;
        location?: string | null;
      }>;

      const branchLookup = new Map<number, (typeof branches)[number]>();
      branches.forEach((branch) => branchLookup.set(branch.id, branch));

      const targetBranch = normalize(detailData.branch as string | undefined);
      const targetDivision = normalize(detailData.division as string | undefined);
      const targetLocation = normalize(detailData.location as string | undefined);

      const candidates = usersData
        .filter((user) => ASSIGNABLE_ROLES.has(user.role ?? ""))
        .filter((user) => {
          const branchInfo = user.branchId ? branchLookup.get(user.branchId) : undefined;
          const userBranch = normalize(user.branchName ?? branchInfo?.name);
          const userDivision = normalize(user.divisionName ?? branchInfo?.divisionName);
          const userLocation = normalize(branchInfo?.location);

          const branchMatches = !targetBranch || userBranch === targetBranch;
          const divisionMatches = !targetDivision || userDivision === targetDivision;
          const locationMatches = !targetLocation || userLocation === targetLocation;

          return branchMatches && divisionMatches && locationMatches;
        })
        .map((user) => ({
          id: user.id,
          fullName: composeFullName(
            user.firstName ?? null,
            user.lastName ?? null,
            user.email ?? null,
            user.email ?? user.id
          ),
          email: user.email,
          role: user.role,
        }));

      const assignableMap = new Map<string, UserOption>();
      candidates.forEach((user) => assignableMap.set(user.id, user));

      if (userId && roles.some((role) => ASSIGNABLE_ROLES.has(role))) {
        assignableMap.set(userId, {
          id: userId,
          fullName: composeFullName(me?.firstName, me?.lastName, me?.email, userId),
          email: typeof me?.email === "string" ? me.email : undefined,
          role: roles[0],
        });
      }

      const findingsRaw = Array.isArray(detailData.findings) ? detailData.findings : [];
      findingsRaw.forEach((item) => {
        if (!item || typeof item !== "object") return;
        const record = item as Record<string, unknown>;
        const assignedId = record.assignedToUserId;
        const assignedName = record.assignedTo;
        if (typeof assignedId === "string" && !assignableMap.has(assignedId)) {
          assignableMap.set(assignedId, {
            id: assignedId,
            fullName:
              typeof assignedName === "string" && assignedName.trim().length > 0
                ? assignedName
                : assignedId,
          });
        }
      });

      const sortedAssignable = Array.from(assignableMap.values()).sort((a, b) =>
        (a.fullName || a.email || a.id).localeCompare(b.fullName || b.email || b.id, undefined, {
          sensitivity: "base",
        })
      );

      const sanitized: Assessment = {
        id: numericId,
        framework: typeof detailData.framework === "string" ? detailData.framework : "",
        division: typeof detailData.division === "string" ? detailData.division : undefined,
        branch: typeof detailData.branch === "string" ? detailData.branch : undefined,
        location: typeof detailData.location === "string" ? detailData.location : undefined,
        status: typeof detailData.status === "string" ? detailData.status : undefined,
        assessmentScope:
          typeof detailData.assessmentScope === "string" ? detailData.assessmentScope : undefined,
        createdBy: typeof detailData.createdBy === "string" ? detailData.createdBy : undefined,
        createdAt:
          typeof detailData.createdAt === "string" ? detailData.createdAt : new Date().toISOString(),
        modifiedDate:
          typeof detailData.modifiedDate === "string" ? detailData.modifiedDate : undefined,
        assessmentDate:
          typeof detailData.assessmentDate === "string" ? detailData.assessmentDate : undefined,
        dueDate: typeof detailData.dueDate === "string" ? detailData.dueDate : undefined,
        progressRate:
          typeof detailData.progressRate === "number" ? detailData.progressRate : undefined,
        findings: findingsRaw.map(mapFinding),
      } as Assessment;

      setAssignableUsers(sortedAssignable);
      setAssessment(sanitized);
    } catch (err) {
      console.error("Assessment detail load failed", err);
      setError(err instanceof Error ? err.message : "Unable to load assessment");
    } finally {
      setLoading(false);
    }
  }, [numericId]);

  useEffect(() => {
    loadAssessment();
  }, [loadAssessment]);

  if (loading) {
    return <p className="mt-8 text-center text-muted-foreground">Loading assessment�</p>;
  }

  if (error || !assessment) {
    return (
      <p className="mt-8 text-center text-red-600">
        {error ?? "Failed to load assessment details."}
      </p>
    );
  }

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
              <strong className="text-foreground">Location:</strong> {assessment.location}
            </span>
          )}
          {assessment.assessmentScope && (
            <span>
              <strong className="text-foreground">Scope:</strong> {assessment.assessmentScope}
            </span>
          )}
          <span>
            <strong className="text-foreground">Created By:</strong> {assessment.createdBy ?? "Unknown"}
          </span>
          <span>
            <strong className="text-foreground">Created At:</strong>{" "}
            {new Date(assessment.createdAt).toLocaleString()}
          </span>
          {assessment.dueDate && (
            <span>
              <strong className="text-foreground">Due Date:</strong> {assessment.dueDate}
            </span>
          )}
          {typeof assessment.progressRate === "number" && (
            <span>
              <strong className="text-foreground">Progress:</strong> {assessment.progressRate}%
            </span>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Control Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <AssessmentTable
            assessmentId={assessment.id}
            findings={assessment.findings ?? []}
            assignableUsers={assignableUsers}
            canEditCompliance={canModerate}
            canReview={canModerate}
            onRefresh={loadAssessment}
          />
        </CardContent>
      </Card>
    </div>
  );
}
