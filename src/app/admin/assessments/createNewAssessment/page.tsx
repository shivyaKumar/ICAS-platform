"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/ui/BackButton";
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
  const { toast } = useToast();

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
  const handleSubmit = async (): Promise<void> => {
    // --------- FRONTEND VALIDATION ---------
    if (!selectedFramework || !selectedDivision || !selectedBranch) {
      toast({
        title: "Missing Required Fields",
        description: "Please select Framework, Division, and Branch.",
        variant: "destructive",
      });
      return;
    }

    if (!assessmentDate || !dueDate) {
      toast({
        title: "Missing Dates",
        description: "Please select both Assessment Date and Due Date.",
        variant: "destructive",
      });
      return;
    }

    if (new Date(dueDate) < new Date(assessmentDate)) {
      toast({
        title: "Invalid Dates",
        description: "Due date cannot be earlier than the assessment date.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      frameworkId: Number(selectedFramework),
      branchId: selectedBranch,
      divisionId: selectedDivision,
      assessmentScope: assessmentScope?.trim() || null,
      assessmentDate: new Date(assessmentDate).toISOString(),
      dueDate: new Date(dueDate).toISOString(),
    };

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        // try to extract a backend-friendly message
        const rawText = await res.text();
        let message = "Failed to create assessment.";

        try {
          const parsed = JSON.parse(rawText);
          if (typeof parsed.message === "string") {
            message = parsed.message;
          }
        } catch {
          if (rawText) message = rawText;
        }

        throw new Error(message);
      }

      toast({
        title: "Assessment Created",
        description: "The new assessment was created successfully.",
        variant: "success",
      });

      // reset form
      setSelectedFramework("");
      setSelectedDivision(null);
      setSelectedBranch(null);
      setAssessmentScope("");
      setAssessmentDate("");
      setDueDate("");
    } catch (err) {
      console.error("Error creating assessment:", err);

      let msg = "Something went wrong. Please try again later.";
      if (err instanceof Error && err.message) {
        msg = err.message;
      }

      toast({
        title: "Error Creating Assessment",
        description: msg,
        variant: "destructive",
      });
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
          <BackButton href="/admin/assessments" />
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
