"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CreateAssessmentPage() {
  const [selectedFramework, setSelectedFramework] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("");
  const [assessmentDate, setAssessmentDate] = useState("");

  // Mock static dropdown options for now
  const frameworks = [
    { id: "iso27001", name: "ISO 27001" },
    { id: "nist", name: "NIST CSF" },
    { id: "gdpr", name: "GDPR" },
  ];

  const divisions = [
    { id: "finance", name: "Finance" },
    { id: "hr", name: "Human Resources" },
    { id: "it", name: "IT Division" },
  ];

  const owners = [
    { id: "1", name: "Alice Smith", divisionId: "finance" },
    { id: "2", name: "Bob Johnson", divisionId: "hr" },
    { id: "3", name: "Charlie Brown", divisionId: "it" },
  ];

  const handleSubmit = () => {
    alert(`
      Framework: ${selectedFramework}
      Division: ${selectedDivision}
      Owner: ${selectedOwner}
      Date: ${assessmentDate}
    `);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Create New Assessment</h2>

      <Card>
        <CardHeader>
          <CardTitle>Select Assessment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Framework */}
          <div>
            <label className="block text-sm font-medium">Select Framework</label>
            <select
              className="w-full border p-2 rounded mt-1"
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
            >
              <option value="">-- Select Framework --</option>
              {frameworks.map((fw) => (
                <option key={fw.id} value={fw.id}>
                  {fw.name}
                </option>
              ))}
            </select>
          </div>

          {/* Division */}
          <div>
            <label className="block text-sm font-medium">Select Division</label>
            <select
              className="w-full border p-2 rounded mt-1"
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
            >
              <option value="">-- Select Division --</option>
              {divisions.map((div) => (
                <option key={div.id} value={div.id}>
                  {div.name}
                </option>
              ))}
            </select>
          </div>

          {/* Owner */}
          <div>
            <label className="block text-sm font-medium">Owner (Auto-assigned)</label>
            <select
              className="w-full border p-2 rounded mt-1"
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
            >
              <option value="">-- Select Owner --</option>
              {owners
                .filter((o) => o.divisionId === selectedDivision)
                .map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium">Assessment Date</label>
            <input
              type="date"
              className="w-full border p-2 rounded mt-1"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
            />
          </div>

          {/* Submit */}
          <Button onClick={handleSubmit} className="w-full bg-primary text-white">
            Submit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
