"use client";

import { useState } from "react";

export default function CurrentAssessmentsPage() {
  // Mock data for now (simulate multiple assessments)
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
    {
      id: 2,
      framework: "GDPR",
      division: "HR",
      date: "2025-09-15",
      status: "Active",
      controls: [
        {
          id: "Art.30",
          name: "Record of Processing",
          status: "Pending",
          implementation: "Not Started",
          gapDescription: "Records incomplete",
          assignedTo: "Charlie",
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

  // Handle field updates
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

  // Save Review (simulate API call)
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

      {currentAssessments.length === 0 && (
        <p className="text-gray-500 italic">No current assessments available.</p>
      )}

      {currentAssessments.map((assessment) => (
        <div
          key={assessment.id}
          className="border rounded-lg shadow p-4 bg-white"
        >
          <h3 className="font-semibold text-lg mb-2">
            {assessment.framework} — {assessment.division} ({assessment.date})
          </h3>

          {/* Scroll wrapper so wide tables don’t break */}
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
                    <td className="border p-2">{ctrl.status}</td>
                    <td className="border p-2">{ctrl.implementation}</td>
                    <td className="border p-2">{ctrl.gapDescription}</td>
                    <td className="border p-2">{ctrl.assignedTo}</td>
                    <td className="border p-2 text-blue-600 underline cursor-pointer">
                      {ctrl.evidence}
                    </td>
                    <td className="border p-2">
                      <select
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
                    <td className="border p-2">
                      <textarea
                        value={ctrl.comments}
                        onChange={(e) =>
                          handleUpdate(
                            assessment.id,
                            ctrl.id,
                            "comments",
                            e.target.value
                          )
                        }
                        className="w-full border rounded p-1"
                        placeholder="Add comments"
                      />
                    </td>
                    <td className="border p-2">
                      <input
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
                        className="border rounded p-1"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => handleSaveReview(assessment.id)}
              className="bg-[#011140] hover:bg-[#022060] text-white px-4 py-2 rounded"
            >
              Save Review
            </button>
            <button
              onClick={() => handleMarkCompleted(assessment.id)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded"
            >
              Mark as Completed
            </button>
          </div>
        </div>
      ))}

      {/* Completed Assessments Preview */}
      {completedAssessments.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold">✅ Completed Assessments</h2>
          <ul className="list-disc pl-6 mt-2">
            {completedAssessments.map((a) => (
              <li key={a.id}>
                {a.framework} — {a.division} ({a.date})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
