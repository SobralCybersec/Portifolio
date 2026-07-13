import { NextResponse } from 'next/server';

/** Allowlist of GitHub API usernames this route is permitted to query (CWE-918). */
const ALLOWED_USERNAMES = new Set(['SobralCybersec', 'MatheusSobralCSharp', 'octocat']);

function safeGithubUsername(value: string | undefined, fallback: string): string {
  if (value && ALLOWED_USERNAMES.has(value)) return value;
  return fallback;
}

export async function GET() {
  try {
    const username = safeGithubUsername(process.env.GITHUB_USERNAME, 'octocat');
    const oldUsername = 'MatheusSobralCSharp';
    const token = process.env.GITHUB_TOKEN;

    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };


    if (token) {
     headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchOpts = { headers, next: { revalidate: 86400 } } as const;

    const [currentUserRes, oldUserRes, currentReposRes, oldReposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, fetchOpts),
      fetch(`https://api.github.com/users/${oldUsername}`, fetchOpts),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100`, fetchOpts),
      fetch(`https://api.github.com/users/${oldUsername}/repos?per_page=100`, fetchOpts),
    ]);

    if (!currentUserRes.ok || !oldUserRes.ok || !currentReposRes.ok || !oldReposRes.ok) {
      throw new Error('Failed to fetch GitHub data');
    }

    const currentUser = await currentUserRes.json();
    const oldUser = await oldUserRes.json();
    const currentRepos = await currentReposRes.json();
    const oldRepos = await oldReposRes.json();

    const oldestCreatedAt = new Date(oldUser.created_at);
    const now = new Date();
    const yearsActive = Math.floor((now.getTime() - oldestCreatedAt.getTime()) / (1000 * 60 * 60 * 24 * 365));

    const totalRepos = currentUser.public_repos + oldUser.public_repos;

    const allRepos = [...currentRepos, ...oldRepos];
    // ponytail: repo.size is the repo disk size in KB, not a commit count.
    // The list endpoint exposes no true commit count, so we use size as a
    // rough relative proxy divided by 10.  The field name is kept as
    // `totalCommits` because Hero.tsx reads it by that key.
    const totalSizeKb = allRepos.reduce((sum: number, repo: any) => {
      return sum + (repo.size || 0);
    }, 0);

    return NextResponse.json(
      { publicRepos: totalRepos, yearsActive, totalCommits: Math.floor(totalSizeKb / 10) },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
    );
  } catch (error) {
    console.error('[github/stats]', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 502 }
    );
  }
}
