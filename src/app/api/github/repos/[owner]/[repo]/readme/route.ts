import { NextResponse } from 'next/server';

const ALLOWED_OWNERS = new Set(['SobralCybersec', 'MatheusSobralCSharp']);
const GITHUB_SLUG_RE = /^[a-zA-Z0-9._-]{1,100}$/;

interface RouteContext {
  params: Promise<{ owner: string; repo: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { owner, repo } = await params;

    if (!ALLOWED_OWNERS.has(owner) || !GITHUB_SLUG_RE.test(repo)) {
      return NextResponse.json({ error: 'Invalid repository' }, { status: 400 });
    }

    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3.raw',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'SobralCybersec-Portfolio',
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { headers, next: { revalidate: 3600 } },
    );

    if (response.status === 404) {
      return NextResponse.json({ readme: null });
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch README' },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { readme: await response.text() },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
