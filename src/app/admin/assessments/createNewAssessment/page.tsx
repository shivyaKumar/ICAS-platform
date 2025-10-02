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

interface Division {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  name: string;
  divisionId: number;
}

export default function CreateAssessmentPage() {
  const [frameworks, setFrameworks] = useState<{ id: string; name: string }[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [selectedFramework, setSelectedFramework] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [assessmentDate, setAssessmentDate] = useState("");

  // ✅ Fetch all data from DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fwRes, divRes, brRes] = await Promise.all([
          fetch("/api/frameworks"),
          fetch("/api/divisions"),
          fetch("/api/branches"),
        ]);

        if (!fwRes.ok || !divRes.ok || !brRes.ok) {
          throw new Error("Failed to load data");
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
        console.error("Error loading data:", err);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = () => {
    alert(`
      Framework: ${selectedFramework}
      Division: ${selectedDivision}
      Branch: ${selectedBranch}
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
                {frameworks.length > 0 ? (
                  frameworks.map((fw) => (
                    <SelectItem key={fw.id} value={fw.id}>
                      {fw.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No frameworks available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Division */}
          <div>
            <Label htmlFor="division">Select Division</Label>
            <Select
              onValueChange={(val) => {
                setSelectedDivision(Number(val));
                setSelectedBranch(null); // reset branch
              }}
              value={selectedDivision?.toString() || ""}
            >
              <SelectTrigger id="division">
                <SelectValue placeholder="-- Select Division --" />
              </SelectTrigger>
              <SelectContent>
                {divisions.length > 0 ? (
                  divisions.map((div) => (
                    <SelectItem key={div.id} value={div.id.toString()}>
                      {div.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No divisions available
                  </SelectItem>
                )}
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
                {branches.filter((b) => b.divisionId === selectedDivision).length > 0 ? (
                  branches
                    .filter((b) => b.divisionId === selectedDivision)
                    .map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        {b.name}
                      </SelectItem>
                    ))
                ) : (
                  <SelectItem value="none" disabled>
                    No branches for this division
                  </SelectItem>
                )}
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
