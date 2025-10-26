import CompletedAssessmentsPanel from "@/components/assessments/CompletedAssessmentsPanel";

export default function AdminCompletedPage() {
  return (
    <div className="p-0">
      <CompletedAssessmentsPanel basePath="/admin/assessments/completed" />
    </div>
  );
}
