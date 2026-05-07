import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: number;
  category: string;
  content: string;
  locale: string;
  coverImage?: string;
  author?: string;
  tags?: string[];
}

export function getAllPosts(locale: string = 'en'): BlogPost[] {
  const localeDir = path.join(postsDirectory, locale);
  
  if (!fs.existsSync(localeDir)) {
    return [];
  }

  const fileNames = fs.readdirSync(localeDir);
  const posts = fileNames
    .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
    .map(fileName => {
      const slug = fileName.replace(/\.(md|mdx)$/, '');
      return getPostBySlug(slug, locale);
    })
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));

  return posts;
}

export function getPostBySlug(slug: string, locale: string = 'en'): BlogPost | null {
  try {
    const localeDir = path.join(postsDirectory, locale);
    const mdPath = path.join(localeDir, `${slug}.md`);
    const mdxPath = path.join(localeDir, `${slug}.mdx`);
    
    const fullPath = fs.existsSync(mdPath) ? mdPath : mdxPath;
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || '',
      description: data.description || '',
      date: data.date || new Date().toISOString(),
      readTime: data.readTime || Math.ceil(content.split(' ').length / 200),
      category: data.category || 'General',
      content,
      locale,
      coverImage: data.coverImage,
      author: data.author,
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

export function getPostsByCategory(category: string, locale: string = 'en'): BlogPost[] {
  return getAllPosts(locale).filter(post => post.category === category);
}

export function getAllCategories(locale: string = 'en'): string[] {
  const posts = getAllPosts(locale);
  const categories = new Set(posts.map(post => post.category));
  return Array.from(categories);
}
