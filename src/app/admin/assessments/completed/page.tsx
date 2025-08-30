"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CompletedAssessmentsPage() {
  // 🔹 Mock completed data (replace with DB/API later)
  const completedAssessments = [
    {
      id: 1,
      framework: "ISO 27001",
      division: "Finance",
      date: "2025-08-20",
      status: "Completed",
      controls: [
        {
          id: "A.5.1.1",
          name: "Information Security Policy",
          status: "Approved",
          implementation: "Implemented",
          gapDescription: "No gaps",
          assignedTo: "Alice",
          evidence: "View File",
          review: "Approved",
          comments: "Well documented.",
          reviewDate: "2025-08-22",
        },
        {
          id: "A.9.2.1",
          name: "Access Control",
          status: "Rejected",
          implementation: "Partial",
          gapDescription: "Policy outdated",
          assignedTo: "Bob",
          evidence: "View File",
          review: "Rejected",
          comments: "Needs revision.",
          reviewDate: "2025-08-23",
        },
      ],
    },
  ];

  const handleGenerateReport = (assessmentId: number) => {
    alert(`Report generated for assessment ID: ${assessmentId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Completed Assessments</h2>
      <p className="text-gray-600">
        Review completed assessments and generate reports.
      </p>

      {completedAssessments.length === 0 ? (
        <Card className="shadow-md border rounded-lg p-6">
          <p className="text-gray-500 italic">No completed assessments available.</p>
        </Card>
      ) : (
        completedAssessments.map((assessment) => (
          <Card key={assessment.id} className="shadow-md border rounded-lg">
            <CardHeader>
              <CardTitle>
                {assessment.framework} — {assessment.division} ({assessment.date})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border text-sm min-w-[1000px]">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="border p-2">ID</th>
                      <th className="border p-2">Control</th>
                      <th className="border p-2">Status</th>
                      <th className="border p-2">Implementation</th>
                      <th className="border p-2">Gap Description</th>
                      <th className="border p-2">Assigned To</th>
                      <th className="border p-2">Evidence</th>
                      <th className="border p-2">Review</th>
                      <th className="border p-2">Comments</th>
                      <th className="border p-2">Review Date</th>
                      <th className="border p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessment.controls.map((ctrl) => (
                      <tr key={ctrl.id} className="border-b">
                        <td className="border p-2">{ctrl.id}</td>
                        <td className="border p-2">{ctrl.name}</td>
                        <td className="border p-2">
                          {ctrl.status === "Pending" && (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          {ctrl.status === "Approved" && (
                            <Badge variant="primary">Approved</Badge>
                          )}
                          {ctrl.status === "Rejected" && (
                            <Badge variant="destructive">Rejected</Badge>
                          )}
                        </td>
                        <td className="border p-2">{ctrl.implementation}</td>
                        <td className="border p-2">{ctrl.gapDescription}</td>
                        <td className="border p-2">{ctrl.assignedTo}</td>
                        <td className="border p-2 text-blue-600 underline cursor-pointer">
                          {ctrl.evidence}
                        </td>
                        <td className="border p-2">{ctrl.review}</td>
                        <td className="border p-2">{ctrl.comments}</td>
                        <td className="border p-2">{ctrl.reviewDate}</td>
                        <td className="border p-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleGenerateReport(assessment.id)}
                          >
                            Generate Report
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
