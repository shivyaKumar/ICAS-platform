import CompletedAssessmentsPanel from "@/components/assessments/CompletedAssessmentsPanel";

export default function StaffCompletedPage() {
  return (
    <div className="p-0">
      <CompletedAssessmentsPanel basePath="/staff/assessments" />
    </div>
  );
}
