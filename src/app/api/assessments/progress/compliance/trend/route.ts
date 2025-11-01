import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const base = (process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5275').replace(/\/+$/, '');
  const params = req.nextUrl.searchParams;
  const year = params.get('year');
  if (!year) return Response.json({ error: 'year is required' }, { status: 400 });
  const framework = params.get('framework');
  const divisionId = params.get('divisionId');
  const qs = new URLSearchParams();
  qs.set('year', year);
  if (framework) qs.set('framework', framework);
  if (divisionId) qs.set('divisionId', divisionId);
  const url = `${base}/api/assessments/progress/compliance/trend?${qs.toString()}`;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { headers: { cookie: req.headers.get('cookie') ?? '' }, cache: 'no-store', signal: controller.signal });
    const body = await res.text();
    return new Response(body, { status: res.status, headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' } });
  } catch {
    return Response.json({ error: 'Upstream unreachable' }, { status: 502 });
  } finally { clearTimeout(t); }
}
