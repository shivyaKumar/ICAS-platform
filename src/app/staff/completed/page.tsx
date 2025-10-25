import CompletedAssessmentsPanel from "@/components/assessments/CompletedAssessmentsPanel";

export default function StaffCompletedPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Completed Assessments</h1>
      <CompletedAssessmentsPanel basePath="/staff/assessments" />
    </div>
  );
}
