"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

/* ---------- Type Definitions ---------- */
interface Framework {
  id: number;
  name: string;
  version?: string | null;
}

interface Division {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  name: string;
  divisionId: number;
  location?: string | null;
}

/* ---------- Component ---------- */
export default function CreateAssessmentPage() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [selectedFramework, setSelectedFramework] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [assessmentScope, setAssessmentScope] = useState("");
  const [assessmentDate, setAssessmentDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- Load initial data ---------- */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [fwRes, divRes, brRes] = await Promise.all([
          fetch(`/api/frameworks`, { headers: { Accept: "application/json" } }),
          fetch(`/api/divisions`, { headers: { Accept: "application/json" } }),
          fetch(`/api/branches`, { headers: { Accept: "application/json" } }),
        ]);

        if (!fwRes.ok || !divRes.ok || !brRes.ok) {
          throw new Error("Failed to load initial data");
        }

        const [fwData, divData, brData] = await Promise.all([
          fwRes.json(),
          divRes.json(),
          brRes.json(),
        ]);

        setFrameworks(fwData || []);
        setDivisions(divData || []);
        setBranches(brData || []);
      } catch (err) {
        console.error("Error loading initial data:", err);
        alert("Failed to load data. Please refresh.");
      }
    };

    fetchInitialData();
  }, []);

  /* ---------- Handle Submit ---------- */
  const handleSubmit = async () => {
    if (!selectedFramework || !selectedBranch) {
      alert("Please select a framework and branch.");
      return;
    }

    const payload = {
      frameworkId: Number(selectedFramework),
      branchId: selectedBranch,
      assessmentScope,
      assessmentDate,
      dueDate,
    };

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include", // send JWT cookie
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text);

      const data = JSON.parse(text);
      alert(
        `Assessment created successfully!\n\nAssigned to all users in ${data.Branch} (${data.Division}).`
      );

      // reset form
      setSelectedFramework("");
      setSelectedDivision(null);
      setSelectedBranch(null);
      setAssessmentScope("");
      setAssessmentDate("");
      setDueDate("");
    } catch (err) {
      console.error("Error creating assessment:", err);
      alert("Failed to create assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- JSX ---------- */
  return (
    <div className="p-0">
      <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
        {/* --- Header --- */}
        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
            Create New Assessment
          </CardTitle>
          <p className="text-sm text-gray-600">
            Fill out the details below to create a new compliance assessment.
          </p>
        </CardHeader>

        {/* --- Content --- */}
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Framework */}
            <div>
              <Label htmlFor="framework">Select Framework</Label>
              <Select
                onValueChange={setSelectedFramework}
                value={selectedFramework}
              >
                <SelectTrigger id="framework">
                  <SelectValue placeholder="-- Select Framework --" />
                </SelectTrigger>
                <SelectContent>
                  {frameworks.map((fw) => (
                    <SelectItem key={fw.id} value={fw.id.toString()}>
                      {fw.name} {fw.version ? `v${fw.version}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Division */}
            <div>
              <Label htmlFor="division">Select Division</Label>
              <Select
                onValueChange={(val) => {
                  setSelectedDivision(Number(val));
                  setSelectedBranch(null);
                }}
                value={selectedDivision?.toString() || ""}
              >
                <SelectTrigger id="division">
                  <SelectValue placeholder="-- Select Division --" />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((div) => (
                    <SelectItem key={div.id} value={div.id.toString()}>
                      {div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Branch */}
            <div>
              <Label htmlFor="branch">Select Branch</Label>
              <Select
                onValueChange={(val) => setSelectedBranch(Number(val))}
                value={selectedBranch?.toString() || ""}
                disabled={!selectedDivision}
              >
                <SelectTrigger id="branch">
                  <SelectValue placeholder="-- Select Branch --" />
                </SelectTrigger>
                <SelectContent>
                  {branches
                    .filter((b) => b.divisionId === selectedDivision)
                    .map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        {b.name} - {b.location || "N/A"}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scope */}
            <div>
              <Label htmlFor="scope">Assessment Scope (optional)</Label>
              <Input
                id="scope"
                placeholder="Example: GDPR 2025 Compliance Review"
                value={assessmentScope}
                onChange={(e) => setAssessmentScope(e.target.value)}
              />
            </div>

            {/* Dates */}
            <div>
              <Label htmlFor="assessmentDate">Assessment Date</Label>
              <Input
                id="assessmentDate"
                type="date"
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button (Full Width) */}
          <div className="pt-6">
            <Button
              variant="secondary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-9 text-base font-semibold tracking-wide"
            >
              {isSubmitting ? "Creating..." : "Create Assessment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
