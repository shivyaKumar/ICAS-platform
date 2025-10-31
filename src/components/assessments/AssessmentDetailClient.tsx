"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AssessmentTable, { type UserOption } from "@/components/assessments/AssessmentTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatAppDate } from "@/lib/date";

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
    priority: getString("priority"),
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
    assignedToEmail:
      getString("assignedToUserEmail"),
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
    commentsThread:
      Array.isArray(source.commentsThread) || Array.isArray(source.CommentsThread)
        ? (source.commentsThread as any[]) || (source.CommentsThread as any[])
        : [],
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

    // --- Handle your backend shape ---
    let role: string | undefined;

    // Check for roles array
    if (Array.isArray(data.roles) && data.roles.length > 0) {
      role = data.roles[0];
    }
    // Fallback: try extracting from claims array if roles missing
    else if (Array.isArray(data.claims)) {
      const roleClaim = data.claims.find(
        (c: any) =>
          c.Type?.includes("identity/claims/role") ||
          c.type?.includes("identity/claims/role")
      );
      if (roleClaim) role = roleClaim.Value || roleClaim.value;
    }

    const result = {
      id: data.userId,
      email: data.email,
      role: role ?? "Standard User", // fallback just in case
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
    };

    console.log(" Role extracted from /api/me:", result.role);
    return result;
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
  const [userRole, setUserRole] = useState<string>("");

  // 🔹 base API (used by download links)
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

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
      setUserRole(me.role ?? "");   
      const userId = me.id ?? "";
      const role = me.role ?? "";

      const detailPath = userId
        ? `/api/assessments/${numericId}?userId=${encodeURIComponent(userId)}`
        : `/api/assessments/${numericId}`;

      // Always fetch assessment
      const detailRes = await fetch(detailPath, { credentials: "include", cache: "no-store" });
      if (!detailRes.ok) throw new Error(await res.text());
      const detailData = await detailRes.json();

      // Only admins should fetch users/branches
      let usersData: any[] = [];
      let branches: any[] = [];

      if (
        role === "Admin" ||
        role === "IT Admin" ||
        role === "Super Admin" ||
        role === "Standard User"
      ) {
        const [usersRes, branchesRes] = await Promise.all([
          fetch("/api/users", { credentials: "include", cache: "no-store" }),
          fetch("/api/branches", { credentials: "include", cache: "no-store" }),
        ]);

        if (usersRes.ok) usersData = await usersRes.json();
        if (branchesRes.ok) branches = await branchesRes.json();
      }

      /* ------------------ Build Assignable User List ------------------ */
      const branchLookup = new Map<number, any>();
      branches.forEach((branch: any) => branchLookup.set(branch.id, branch));

      const targetBranch = normalize(detailData.branch);
      const targetDivision = normalize(detailData.division);
      const targetLocation = normalize(detailData.location);

      // Define allowed roles exactly matching backend logic
      const ASSIGNABLE_ROLES = new Set(["admin", "standard user"]);

      const candidates = (Array.isArray(usersData) ? usersData : [])
        .filter((user: any) => {
          if (!user.role) return false;

          const normalizedRole = user.role.trim().toLowerCase();
          if (!ASSIGNABLE_ROLES.has(normalizedRole)) return false;

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
        isClosed: detailData.isClosed ?? false,
        createdBy: detailData.createdBy,
        createdAt: detailData.createdAt ?? new Date().toISOString(),
        dueDate: detailData.dueDate,
        closedBy: detailData.closedBy,
        closedAt: detailData.closedAt,
        modifiedDate: detailData.modifiedDate,
        assessmentScope: detailData.assessmentScope,
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
      {/* ---------- Modern Two-Column Assessment Summary Card ---------- */}
      <Card className="border border-gray-200 shadow-sm rounded-xl bg-gradient-to-br from-yellow-50 via-white to-gray-50
      ">
        <CardHeader className="pb-2 border-b border-gray-100">
          <CardTitle className="flex flex-wrap items-center gap-2 text-2xl font-semibold text-gray-800">
            <span>{assessment.framework}</span>
            {assessment.branch && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-1 bg-blue-100 text-blue-800"
              >
                {assessment.branch}
              </Badge>
            )}
            {assessment.division && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-1 border-gray-300 text-gray-700"
              >
                {assessment.division}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 py-4 text-sm">
          {/* Column 1 */}
          <div className="space-y-3">
            {assessment.assessmentScope && (
              <div>
                <p className="text-xs uppercase font-semibold text-gray-500 tracking-wide">
                  Scope
                </p>
                <p className="text-gray-800">{assessment.assessmentScope}</p>
              </div>
            )}

            {assessment.location && (
              <div>
                <p className="text-xs uppercase font-semibold text-gray-500 tracking-wide">
                  Location
                </p>
                <p className="text-gray-800">{assessment.location}</p>
              </div>
            )}

            <div>
              <p className="text-xs uppercase font-semibold text-gray-500 tracking-wide">
                Created By
              </p>
              <p className="text-gray-800">{assessment.createdBy ?? "Unknown"}</p>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase font-semibold text-gray-500 tracking-wide">
                Created At
              </p>
              <p className="text-gray-800">
                {formatAppDate(assessment.createdAt)}
              </p>
            </div>

            {assessment.dueDate && (
              <div>
                <p className="text-xs uppercase font-semibold text-gray-500 tracking-wide">
                  Due Date
                </p>
                <p className="text-gray-800">
                  {new Date(assessment.dueDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {assessment.status === "Completed" && (
              <>
                {assessment.closedAt && (
                  <div>
                    <p className="text-xs uppercase font-semibold text-gray-500 tracking-wide">
                      Closed At
                    </p>
                    <p className="text-gray-800">
                      {formatAppDate(assessment.closedAt)}
                    </p>
                  </div>
                )}
                {assessment.closedBy && (
                  <div>
                    <p className="text-xs uppercase font-semibold text-gray-500 tracking-wide">
                      Closed By
                    </p>
                    <p className="text-gray-800">{assessment.closedBy}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        {/* 🔽 Button updated: CSV removed, XLSX renamed to "Export Report" */}
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Assessment Findings</CardTitle>

          {(assessment.isClosed === true ||
            (assessment.status ?? "").trim().toLowerCase() === "completed") && (
            <div className="flex gap-2">
              <a
                href={`${base}/api/assessments/${numericId}/export/xlsx`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium border-green-600 text-green-700 hover:bg-green-50"
              >
                Export Report
              </a>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <AssessmentTable
            findings={assessment.findings ?? []}
            assignableUsers={assignableUsers}
            userRole={userRole}
            onRefresh={loadAssessment}
            isCompleted={(assessment.status ?? "").trim().toLowerCase() === "completed" || assessment.isClosed === true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
