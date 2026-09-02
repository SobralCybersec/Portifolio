export interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  previewImage?: string;
  isVideo?: boolean;
  techStack?: string[];
  allLanguages?: string[];
  owner?: {
    login: string;
  };
}

export interface ProjectCardColors {
  bg: string;
  panel: string;
  panel2: string;
  primary: string;
  primaryBright: string;
  primaryDark: string;
  white: string;
  muted: string;
  border: string;
  glow: string;
}
