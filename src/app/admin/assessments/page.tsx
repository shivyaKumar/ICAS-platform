"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ClipboardList, CheckCircle } from "lucide-react";

export default function AssessmentsPage() {
  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 space-y-6">
      {/* Page Heading */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold">Assessments</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage compliance assessments across all frameworks and divisions.
        </p>
      </div>

      {/* Cards Grid: always at least 2 columns; 3 on md+ */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 min-w-0">
        {/* Create New */}
        <Link href="/admin/assessments/createNewAssessment" className="min-w-0">
          <Card
            className="h-full bg-white border border-primary
                       hover:scale-105 hover:shadow-2xl
                       transform transition-transform duration-300 ease-in-out cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm md:text-base font-semibold">
                <PlusCircle className="h-5 w-5 text-primary" />
                <span className="truncate">Create New Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground">
                Start a new compliance cycle by selecting a framework and division.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Current */}
        <Link href="/admin/assessments/current" className="min-w-0">
          <Card
            className="h-full bg-white border border-primary
                       hover:scale-105 hover:shadow-2xl
                       transform transition-transform duration-300 ease-in-out cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm md:text-base font-semibold">
                <ClipboardList className="h-5 w-5 text-primary" />
                <span className="truncate">Current Assessments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground">
                View and manage ongoing assessments with pending tasks.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Completed */}
        <Link href="/admin/assessments/completed" className="min-w-0">
          <Card
            className="h-full bg-white border border-green-600
                       hover:scale-105 hover:shadow-2xl
                       transform transition-transform duration-300 ease-in-out cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm md:text-base font-semibold">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="truncate">Completed Assessments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground">
                Review completed assessments and generate reports for auditing.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
