import type { Repo } from '@/components/projects/project-card-types';

const normalize = (value: string) => value
  .toLowerCase()
  .replace(/c\+\+/g, 'cpp')
  .replace(/c#/g, 'csharp')
  .replace(/next\.?js/g, 'nextjs')
  .replace(/[^a-z0-9]/g, '');

const matchesNormalized = (value: string, target: string) => (
  value === target || (target.length > 2 && (value.includes(target) || target.includes(value)))
);

export function projectMatchesSkill(repo: Repo, skill: string): boolean {
  const target = normalize(skill);
  if (!target) return false;

  const metadata = [
    repo.language,
    ...(repo.allLanguages ?? []),
    ...(repo.topics ?? []),
    ...(repo.techStack ?? []),
  ].filter((value): value is string => Boolean(value));

  if (metadata.some((value) => matchesNormalized(normalize(value), target))) {
    return true;
  }

  if (target.length <= 2) return false;

  return [repo.name, repo.description ?? '']
    .some((value) => normalize(value).includes(target));
}

export function filterProjectsBySkill(repos: Repo[], skill: string): Repo[] {
  return repos.filter((repo) => projectMatchesSkill(repo, skill));
}
