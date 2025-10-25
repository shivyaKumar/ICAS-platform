import CompletedAssessmentsPanel from "@/components/assessments/CompletedAssessmentsPanel";

export default function AdminCompletedPage() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Completed Assessments</h1>
      <CompletedAssessmentsPanel basePath="/admin/assessments/completed" />
    </div>
  );
}
