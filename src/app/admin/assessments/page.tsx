"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ClipboardList, CheckCircle } from "lucide-react";

export default function AssessmentsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Heading */}
      <div>
        <h2 className="text-2xl font-bold">Assessments</h2>
        <p className="text-muted-foreground">
          Manage compliance assessments across all frameworks and divisions.
        </p>
      </div>

      {/* 3 Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create New */}
        <Link href="/admin/assessments/createNewAssessment">
          <Card className="hover:scale-105 hover:shadow-lg transition cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary" />
                Create New Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Start a new compliance cycle by selecting a framework and division.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Current */}
        <Link href="/admin/assessments/current">
          <Card className="hover:scale-105 hover:shadow-lg transition cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-yellow-500" />
                Current Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and manage ongoing assessments with pending tasks.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Completed */}
        <Link href="/admin/assessments/completed">
          <Card className="hover:scale-105 hover:shadow-lg transition cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Completed Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Review completed assessments and generate reports for auditing.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
