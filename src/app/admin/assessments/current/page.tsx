"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"; // reusable Input
import { Label } from "@/components/ui/label"; // reusable Label

export default function CurrentAssessmentsPage() {
  // Mock data
  const [currentAssessments, setCurrentAssessments] = useState([
    {
      id: 1,
      framework: "ISO 27001",
      division: "Finance",
      date: "2025-09-12",
      status: "Active",
      controls: [
        {
          id: "A.5.1.1",
          name: "Information Security Policy",
          status: "Pending",
          implementation: "In Progress",
          gapDescription: "Policy needs review",
          assignedTo: "Alice",
          evidence: "View File",
          review: "",
          comments: "",
          reviewDate: "",
        },
        {
          id: "A.9.2.1",
          name: "Access Control",
          status: "Pending",
          implementation: "N/A",
          gapDescription: "Policy not updated",
          assignedTo: "Bob",
          evidence: "View File",
          review: "",
          comments: "",
          reviewDate: "",
        },
      ],
    },
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [completedAssessments, setCompletedAssessments] = useState<any[]>([]);

  // Handle updates
  const handleUpdate = (
    assessmentId: number,
    ctrlId: string,
    field: string,
    value: string
  ) => {
    setCurrentAssessments((prev) =>
      prev.map((a) =>
        a.id === assessmentId
          ? {
              ...a,
              controls: a.controls.map((c) =>
                c.id === ctrlId ? { ...c, [field]: value } : c
              ),
            }
          : a
      )
    );
  };

  // Save Review
  const handleSaveReview = (assessmentId: number) => {
    const updated = currentAssessments.find((a) => a.id === assessmentId);
    console.log("Saving review to DB:", updated);
    alert(`Review for ${updated?.framework} - ${updated?.division} saved!`);
  };

  // Mark as Completed
  const handleMarkCompleted = (assessmentId: number) => {
    const completed = currentAssessments.find((a) => a.id === assessmentId);
    if (completed) {
      setCompletedAssessments((prev) => [
        ...prev,
        { ...completed, status: "Completed" },
      ]);
      setCurrentAssessments((prev) =>
        prev.filter((a) => a.id !== assessmentId)
      );
      alert(`${completed.framework} - ${completed.division} moved to Completed!`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Current Assessments (Admin)</h2>

      {currentAssessments.map((assessment) => (
        <div
          key={assessment.id}
          className="border rounded-lg shadow p-4 bg-white"
        >
          <h3 className="font-semibold text-lg mb-2">
            {assessment.framework} — {assessment.division} ({assessment.date})
          </h3>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border text-sm min-w-[1000px]">
              <thead className="bg-black text-white">
                <tr>
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Control</th>
                  <th className="border p-2">Compliance Status</th>
                  <th className="border p-2">Implementation</th>
                  <th className="border p-2">Gap Description</th>
                  <th className="border p-2">Assigned To</th>
                  <th className="border p-2">Evidence</th>
                  <th className="border p-2">Review</th>
                  <th className="border p-2">Comments</th>
                  <th className="border p-2">Review Date</th>
                </tr>
              </thead>
              <tbody>
                {assessment.controls.map((ctrl) => (
                  <tr key={ctrl.id} className="border-b">
                    <td className="border p-2">{ctrl.id}</td>
                    <td className="border p-2">{ctrl.name}</td>

                    {/* Badge */}
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

                    {/* Review Dropdown */}
                    <td className="border p-2">
                      <Label htmlFor={`review-${ctrl.id}`} className="sr-only">
                        Review
                      </Label>
                      <select
                        id={`review-${ctrl.id}`}
                        value={ctrl.review}
                        onChange={(e) =>
                          handleUpdate(
                            assessment.id,
                            ctrl.id,
                            "review",
                            e.target.value
                          )
                        }
                        className="border p-1 rounded"
                      >
                        <option value="">-- Select --</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Request Change">Request Change</option>
                      </select>
                    </td>

                    {/* Comments */}
                    <td className="border p-2">
                      <Label htmlFor={`comments-${ctrl.id}`} className="sr-only">
                        Comments
                      </Label>
                      <Input
                        id={`comments-${ctrl.id}`}
                        value={ctrl.comments}
                        onChange={(e) =>
                          handleUpdate(
                            assessment.id,
                            ctrl.id,
                            "comments",
                            e.target.value
                          )
                        }
                        placeholder="Add comments"
                      />
                    </td>

                    {/* Review Date */}
                    <td className="border p-2">
                      <Label htmlFor={`date-${ctrl.id}`} className="sr-only">
                        Review Date
                      </Label>
                      <Input
                        id={`date-${ctrl.id}`}
                        type="date"
                        value={ctrl.reviewDate}
                        onChange={(e) =>
                          handleUpdate(
                            assessment.id,
                            ctrl.id,
                            "reviewDate",
                            e.target.value
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-4">
            <Button variant="secondary" size="sm" onClick={() => handleSaveReview(assessment.id)}>
              Save Review
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleMarkCompleted(assessment.id)}>
              Mark as Completed
            </Button>
          </div>
        </div>
      ))}

      {/* Completed Assessments */}
      {completedAssessments.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold">Completed Assessments</h2>
          <ul className="list-disc pl-6 mt-2">
            {completedAssessments.map((a) => (
              <li key={a.id}>
                {a.framework} — {a.division} ({a.date})
                <Badge variant="primary" className="ml-2">Completed</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
