"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AssessmentTable from "@/components/assessments/AssessmentTable";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Finding } from "@/types/assessment"; // ✅ Use shared type

interface Assessment {
  id: number;
  framework: string;
  division: string;
  branch: string;
  location: string;
  createdBy: string;
  createdAt: string;
  assessmentScope?: string;
  findings: Finding[];
}

/* ---------- Component ---------- */
export default function AssessmentDetailsPage() {
  const { id } = useParams();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const [assessmentRes, meRes] = await Promise.all([
          fetch(`/api/assessments/${id}`, {
            cache: "no-store",
            credentials: "include",
          }),
          fetch("/api/me", { cache: "no-store", credentials: "include" }),
        ]);

        if (!assessmentRes.ok)
          throw new Error(`Failed to fetch assessment: ${assessmentRes.status}`);

        const assessmentData: Assessment = await assessmentRes.json();
        setAssessment(assessmentData);

        if (meRes.ok) {
          const meData = await meRes.json();
          let role = "";

          if (Array.isArray(meData)) {
            for (const claim of meData) {
              if (claim?.type?.toLowerCase().includes("identity/claims/role")) {
                role = claim?.value ?? "";
                break;
              }
            }
          } else if (meData && typeof meData === "object") {
            if (Array.isArray((meData as { roles?: unknown }).roles) && (meData as { roles: string[] }).roles.length) {
              role = (meData as { roles: string[] }).roles[0] ?? "";
            }
            if (!role && Array.isArray((meData as { Roles?: unknown }).Roles) && (meData as { Roles: string[] }).Roles.length) {
              role = (meData as { Roles: string[] }).Roles[0] ?? "";
            }
            role =
              meData.role ??
              meData.Role ??
              meData.userRole ??
              meData.UserRole ??
              "";

            if (!role && Array.isArray((meData as { claims?: unknown }).claims)) {
              for (const claim of (meData as { claims: any[] }).claims) {
                if (claim?.type?.toLowerCase().includes("identity/claims/role")) {
                  role = claim?.value ?? "";
                  break;
                }
              }
            }
          }

          setUserRole(typeof role === "string" ? role : "");
        } else {
          setUserRole("");
        }
      } catch (err) {
        console.error("Error fetching assessment:", err);
        setError("Unable to load assessment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-8">
        Loading assessment details...
      </p>
    );

  if (error || !assessment)
    return (
      <p className="text-center text-red-500 mt-8">
        {error ?? "Failed to load assessment details."}
      </p>
    );

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {assessment.framework} — {assessment.branch} ({assessment.division})
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-1 text-sm">
          {assessment.assessmentScope && (
            <p>
              <strong>Scope:</strong> {assessment.assessmentScope}
            </p>
          )}
          <p>
            <strong>Location:</strong> {assessment.location}
          </p>
          <p>
            <strong>Created By:</strong> {assessment.createdBy}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(assessment.createdAt).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Control Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <AssessmentTable
            findings={assessment.findings || []}
            userRole={userRole}
          />
        </CardContent>
      </Card>
    </div>
  );
}
