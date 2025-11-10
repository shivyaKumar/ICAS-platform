"use client";

import { useEffect, useMemo, useState } from "react";

export type ComplianceItem = {
  id?: string;
  name: string;
  compliancePercent: number | null; // null signals data issue
  yes: number;
  partially: number;
  no: number;
  // Extended meta (may be supplied by backend; fallbacks computed locally)
  weightedNumerator?: number; // Sum of weighted compliant segments
  weightedDenominator?: number; // Total weighted controls considered
  totalControls?: number; // Total distinct controls in framework scope
  assessedControls?: number; // Distinct controls assessed
  errorMessage?: string; // Backend-provided issue description
};
export type TrendItem = { year: number; month: number; compliancePercent: number; yes: number; partially: number; no: number };

export function useDashboardData(staffMode?: boolean) {
  const [year, setYear] = useState<string | undefined>(String(new Date().getFullYear()));
  const [framework, setFramework] = useState<string | undefined>(undefined);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | undefined>(undefined);

  const [byFramework, setByFramework] = useState<ComplianceItem[]>([]);
  const [byDivision, setByDivision] = useState<ComplianceItem[]>([]);
  const [byBranch, setByBranch] = useState<ComplianceItem[]>([]);
  const [trend, setTrend] = useState<TrendItem[]>([]);

  const [overallCompliancePercent, setOverallCompliancePercent] = useState<number>(0);
  const [activeAssessments, setActiveAssessments] = useState<number>(0);
  const [completedAssessments, setCompletedAssessments] = useState<number>(0);
  const [nonCompliantControls, setNonCompliantControls] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load framework list (admin mode only)
  useEffect(() => {
    let cancelled = false;
    if (staffMode) { setByFramework([]); return; }
    (async () => {
      setLoading(true); setError(null);
      try {
        const fwRes = await fetch(`/api/assessments/progress/compliance/by-framework${year ? `?year=${year}` : ''}`, { cache: 'no-store', credentials: 'include' });
        if (!fwRes.ok) { if (!cancelled) setByFramework([]); return; }
        const fw = await fwRes.json();
        if (!cancelled) {
          const arr = Array.isArray(fw) ? fw : [];
          // Normalize extended shape & ensure numeric fallbacks
          setByFramework(arr.map(x => {
            const yes = x.yes ?? x.Yes ?? 0;
            const partially = x.partially ?? x.Partially ?? 0;
            const no = x.no ?? x.No ?? 0;
            const denom = x.weightedDenominator ?? x.WeightedDenominator ?? (yes + partially + no);
            const numer = x.weightedNumerator ?? x.WeightedNumerator ?? Math.round((x.compliancePercent ?? x.CompliancePercent ?? 0) * denom / 100);
            return {
              id: x.id || x.Id,
              name: x.name || x.Name || 'Unknown',
              compliancePercent: (x.compliancePercent ?? x.CompliancePercent ?? 0),
              yes, partially, no,
              weightedNumerator: numer,
              weightedDenominator: denom,
              totalControls: x.totalControls ?? x.TotalControls ?? denom,
              assessedControls: x.assessedControls ?? x.AssessedControls ?? denom,
              errorMessage: x.errorMessage || x.ErrorMessage || undefined,
            } as ComplianceItem;
          }));
        }
      } catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load by-framework'); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [year, staffMode]);

  // Load division list filtered by framework (admin mode only)
  useEffect(() => {
    let cancelled = false;
    if (staffMode) { setByDivision([]); return; }
    (async () => {
      try {
        const qs = new URLSearchParams();
        if (framework) qs.set('framework', framework);
        if (year) qs.set('year', year);
        const res = await fetch(`/api/assessments/progress/compliance/by-division${qs.toString() ? `?${qs.toString()}` : ''}`, { cache: 'no-store', credentials: 'include' });
        if (!res.ok) { if (!cancelled) setByDivision([]); return; }
        const data = await res.json();
        if (!cancelled) setByDivision(Array.isArray(data) ? data.map(x => ({
          id: x.id || x.Id,
          name: x.name || x.Name || 'Unknown',
          compliancePercent: (x.compliancePercent ?? x.CompliancePercent ?? 0),
          yes: x.yes ?? x.Yes ?? 0,
          partially: x.partially ?? x.Partially ?? 0,
          no: x.no ?? x.No ?? 0,
          weightedDenominator: x.weightedDenominator ?? x.WeightedDenominator ?? ( (x.yes ?? x.Yes ?? 0) + (x.partially ?? x.Partially ?? 0) + (x.no ?? x.No ?? 0) ),
          weightedNumerator: x.weightedNumerator ?? x.WeightedNumerator ?? Math.round(((x.compliancePercent ?? x.CompliancePercent ?? 0) * (x.weightedDenominator ?? x.WeightedDenominator ?? ((x.yes ?? x.Yes ?? 0) + (x.partially ?? x.Partially ?? 0) + (x.no ?? x.No ?? 0)))) / 100),
        })) : []);
      } catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load by-division'); }
    })();
    return () => { cancelled = true; };
  }, [framework, year, staffMode]);

  // Auto-select first division (admin)
  useEffect(() => {
    if (staffMode) return;
    if (!selectedDivisionId && byDivision.length > 0 && byDivision[0].id) {
      setSelectedDivisionId(String(byDivision[0].id));
    }
  }, [byDivision, selectedDivisionId, staffMode]);

  // Load branch list
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (staffMode) {
          const qs = new URLSearchParams();
          if (framework) qs.set('framework', framework);
          if (year) qs.set('year', year);
          const res = await fetch(`/api/assessments/progress/compliance/my-branch${qs.toString() ? `?${qs.toString()}` : ''}`, { cache: 'no-store', credentials: 'include' });
          if (!res.ok) { if (!cancelled) setByBranch([]); return; }
          const data = await res.json();
          const item: ComplianceItem | null = data && (data.name || data.Name) ? {
            id: data.id || data.Id,
            name: data.name || data.Name,
            yes: data.yes ?? data.Yes ?? 0,
            partially: data.partially ?? data.Partially ?? 0,
            no: data.no ?? data.No ?? 0,
            compliancePercent: (data.compliancePercent ?? data.CompliancePercent ?? 0),
            weightedDenominator: data.weightedDenominator ?? data.WeightedDenominator ?? ((data.yes ?? data.Yes ?? 0) + (data.partially ?? data.Partially ?? 0) + (data.no ?? data.No ?? 0)),
            weightedNumerator: data.weightedNumerator ?? data.WeightedNumerator ?? Math.round(((data.compliancePercent ?? data.CompliancePercent ?? 0) * (data.weightedDenominator ?? data.WeightedDenominator ?? ((data.yes ?? data.Yes ?? 0) + (data.partially ?? data.Partially ?? 0) + (data.no ?? data.No ?? 0)))) / 100),
          } : null;
          if (!cancelled) setByBranch(item ? [item] : []);
          return;
        }
        if (!selectedDivisionId) { setByBranch([]); return; }
        const qs = new URLSearchParams();
        qs.set('divisionId', selectedDivisionId);
        if (framework) qs.set('framework', framework);
        if (year) qs.set('year', year);
        const res = await fetch(`/api/assessments/progress/compliance/by-branch?${qs.toString()}`, { cache: 'no-store', credentials: 'include' });
        if (!res.ok) { if (!cancelled) setByBranch([]); return; }
        const data = await res.json();
        if (!cancelled) setByBranch(Array.isArray(data) ? data.map(x => ({
          id: x.id || x.Id,
          name: x.name || x.Name || 'Unknown',
          compliancePercent: (x.compliancePercent ?? x.CompliancePercent ?? 0),
          yes: x.yes ?? x.Yes ?? 0,
          partially: x.partially ?? x.Partially ?? 0,
          no: x.no ?? x.No ?? 0,
          weightedDenominator: x.weightedDenominator ?? x.WeightedDenominator ?? ((x.yes ?? x.Yes ?? 0) + (x.partially ?? x.Partially ?? 0) + (x.no ?? x.No ?? 0)),
          weightedNumerator: x.weightedNumerator ?? x.WeightedNumerator ?? Math.round(((x.compliancePercent ?? x.CompliancePercent ?? 0) * (x.weightedDenominator ?? x.WeightedDenominator ?? ((x.yes ?? x.Yes ?? 0) + (x.partially ?? x.Partially ?? 0) + (x.no ?? x.No ?? 0)))) / 100),
        })) : []);
      } catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load by-branch'); }
    })();
    return () => { cancelled = true; };
  }, [selectedDivisionId, framework, year, staffMode]);

  // Load trend
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const qs = new URLSearchParams();
        if (year) qs.set('year', year);
        if (framework) qs.set('framework', framework);
        const path = staffMode ? '/api/assessments/progress/compliance/my-trend' : '/api/assessments/progress/compliance/trend';
        const res = await fetch(`${path}?${qs.toString()}`, { cache: 'no-store', credentials: 'include' });
        if (!res.ok) { if (!cancelled) setTrend([]); return; }
        const data = await res.json();
        if (!cancelled) setTrend(Array.isArray(data) ? data : []);
      } catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load trend'); }
    })();
    return () => { cancelled = true; };
  }, [framework, year, staffMode]);

  // Derive overall stats (tiles) - now reflect backend weighted percentages
  useEffect(() => {
    if (staffMode) {
      const b = byBranch[0];
  const rawPct = b?.compliancePercent;
  const pct = (rawPct !== null && rawPct !== undefined && Number.isFinite(rawPct)) ? Math.round(rawPct) : 0;
      setOverallCompliancePercent(pct);
      setNonCompliantControls(b ? b.no : 0);
      return;
    }
    // Admin: weighted average across frameworks using per-framework denom as weight
    const all = byFramework;
    const weight = all.reduce((acc, x) => acc + (x.weightedDenominator ?? (x.yes + x.partially + x.no)), 0);
    const weighted = weight > 0 ? all.reduce((acc, x) => {
      const denom = x.weightedDenominator ?? (x.yes + x.partially + x.no);
      const pct = x.compliancePercent ?? 0;
      return acc + (pct * denom);
    }, 0) / weight : 0;
    setOverallCompliancePercent(Math.round(weighted));
    // Keep non-compliant control count as backend total 'no'
    const totalsNo = all.reduce((acc, x) => acc + x.no, 0);
    setNonCompliantControls(totalsNo);
  }, [byFramework, byBranch, staffMode]);

  // Completed + Active metrics
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const comp = await fetch('/api/assessments/completed', { cache: 'no-store', credentials: 'include' });
        if (!comp.ok) { if (!cancelled) setCompletedAssessments(0); } else {
          const arr = await comp.json();
          if (!cancelled) setCompletedAssessments(Array.isArray(arr) ? arr.length : 0);
        }
      } catch {}
      if (staffMode) return;
      try {
        const hier = await fetch('/api/assessments/progress/by-division-hier', { cache: 'no-store', credentials: 'include' });
        if (!hier.ok) { if (!cancelled) setActiveAssessments(0); } else {
          const h = await hier.json();
          if (!cancelled) setActiveAssessments(Number(h?.overallActiveAssessments ?? 0));
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [staffMode]);

  const frameworkOptions = useMemo(() => byFramework.map(f => f.name), [byFramework]);

  return {
    year, setYear, framework, setFramework, selectedDivisionId, setSelectedDivisionId,
    byFramework, byDivision, byBranch, trend,
    overallCompliancePercent, activeAssessments, completedAssessments, nonCompliantControls,
    loading, error,
    frameworkOptions,
  };
}