export type ProgressSummary = { id: string; name: string; completed: number; pending: number; notCompleted: number };

const json = async <T>(url: string) => {
  const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
};

export const fetchDivisionProgress = () => json<ProgressSummary[]>('/api/assessments/progress/by-division');
export const fetchProjectProgress = () => json<ProgressSummary[]>('/api/assessments/progress/by-project');
