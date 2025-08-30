"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // use Label
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function CreateAssessmentPage() {
  const [selectedFramework, setSelectedFramework] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("");
  const [assessmentDate, setAssessmentDate] = useState("");

  // Mock static dropdown options
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
            <Label htmlFor="framework">Select Framework</Label>
            <Select onValueChange={setSelectedFramework} value={selectedFramework}>
              <SelectTrigger id="framework">
                <SelectValue placeholder="-- Select Framework --" />
              </SelectTrigger>
              <SelectContent>
                {frameworks.map((fw) => (
                  <SelectItem key={fw.id} value={fw.id}>
                    {fw.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Division */}
          <div>
            <Label htmlFor="division">Select Division</Label>
            <Select onValueChange={setSelectedDivision} value={selectedDivision}>
              <SelectTrigger id="division">
                <SelectValue placeholder="-- Select Division --" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((div) => (
                  <SelectItem key={div.id} value={div.id}>
                    {div.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Owner */}
          <div>
            <Label htmlFor="owner">Owner (Auto-assigned)</Label>
            <Select onValueChange={setSelectedOwner} value={selectedOwner}>
              <SelectTrigger id="owner">
                <SelectValue placeholder="-- Select Owner --" />
              </SelectTrigger>
              <SelectContent>
                {owners
                  .filter((o) => o.divisionId === selectedDivision)
                  .map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date">Assessment Date</Label>
            <Input
              id="date"
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Submit */}
          <Button variant="secondary" onClick={handleSubmit} className="w-full">
            Submit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
