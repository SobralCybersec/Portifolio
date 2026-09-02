export type BlogPostMetadata = {
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  draft: boolean;
  pinned?: boolean;
  cover?: string;
  translationKey?: string;
};

export type BlogPost = BlogPostMetadata & {
  year: string;
  month: string;
  day: string;
  slug: string;
  route: string;
  sourcePath: string;
  locale: string;
};

export type BlogTag = {
  slug: string;
  label: string;
  description: string;
  aliases: string[];
  kind?: 'topic' | 'project';
};

export type BlogMonthGroup = {
  key: string;
  year: string;
  month: string;
  label: string;
  posts: BlogPost[];
};

export type BlogQuery = {
  locale?: string;
  includeDrafts?: boolean;
  includeFuture?: boolean;
  now?: Date;
};
