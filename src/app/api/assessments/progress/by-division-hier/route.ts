import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const base = (process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5275').replace(/\/+$/, '');
  const url = `${base}/api/assessments/progress/by-division-hier?includeFrameworks=true`;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      headers: { cookie: req.headers.get('cookie') ?? '' },
      cache: 'no-store',
      signal: controller.signal
    });
    const body = await res.text();
    return new Response(body, { status: res.status, headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' } });
  } catch {
    return Response.json({ error: 'Upstream unreachable' }, { status: 502 });
  } finally {
    clearTimeout(t);
  }
}
