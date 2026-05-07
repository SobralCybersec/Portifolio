import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { translateBlogPost, getSupportedLocales } from '@/lib/translate';

interface Frontmatter {
  title: string;
  description: string;
  category: string;
  tags: string[];
  coverImage?: string;
  date: string;
  readTime: number;
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, title, description, category, tags, content, coverImage, date, autoTranslate } = body;

    if (!slug || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const frontmatter: Frontmatter = {
      title,
      description,
      category,
      tags,
      coverImage,
      date: date || new Date().toISOString(),
      readTime: Math.ceil(content.split(' ').length / 200),
    };

    const locales = autoTranslate ? getSupportedLocales() : ['en'];

    for (const locale of locales) {
      let finalFrontmatter: Frontmatter = frontmatter;
      let finalContent = content;

      if (locale !== 'en' && autoTranslate) {
        const translated = await translateBlogPost(content, frontmatter, locale, 'en');
        finalFrontmatter = translated.frontmatter as Frontmatter;
        finalContent = translated.content;
      }

      // Remove empty <p></p> tags and &nbsp; entities
      const cleanContent = finalContent
        .replace(/<p>\s*<\/p>/g, '')
        .replace(/<p>\s*&nbsp;\s*<\/p>/g, '')
        .replace(/&nbsp;/g, ' ');
      const fileContent = matter.stringify(cleanContent, finalFrontmatter);
      const filepath = path.join(process.cwd(), 'src', 'content', 'blog', locale, `${slug}.md`);

      await writeFile(filepath, fileContent, 'utf-8');
    }

    return NextResponse.json({ 
      success: true, 
      slug,
      locales: locales.length,
      message: 'Post updated successfully'
    });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}
