import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const username = process.env.GITHUB_USERNAME || 'octocat';
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
    const totalCommits = allRepos.reduce((sum: number, repo: any) => {
      return sum + (repo.size || 0);
    }, 0);

    return NextResponse.json(
      { publicRepos: totalRepos, yearsActive, totalCommits: Math.floor(totalCommits / 10) },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
    );
  } catch (error) {
    return NextResponse.json(
      { publicRepos: 50, yearsActive: 5, totalCommits: 1000 },
      { status: 200 }
    );
  }
}
