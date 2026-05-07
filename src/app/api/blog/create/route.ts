import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, content, locale = 'en', tags = [], coverImage, autoTranslate = false } = body;

    if (!title || !description || !category || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create frontmatter
    const frontmatter: any = {
      title,
      description,
      category,
      date: new Date().toISOString(),
      readTime: Math.ceil(content.split(' ').length / 200),
    };

    if (tags && tags.length > 0) {
      frontmatter.tags = tags;
    }

    if (coverImage) {
      frontmatter.coverImage = coverImage;
    }

    // Combine frontmatter and content
    const fileContent = matter.stringify(content, frontmatter);

    // Save to locale directory
    const localeDir = path.join(process.cwd(), 'src/content/blog', locale);
    if (!fs.existsSync(localeDir)) {
      fs.mkdirSync(localeDir, { recursive: true });
    }

    const filePath = path.join(localeDir, `${slug}.md`);
    fs.writeFileSync(filePath, fileContent, 'utf8');

    // Auto-translate if requested
    if (autoTranslate) {
      const locales = ['pt', 'es', 'fr', 'de', 'ja', 'zh'];
      for (const targetLocale of locales) {
        if (targetLocale !== locale) {
          try {
            const translateRes = await fetch(`${request.nextUrl.origin}/api/translate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: content,
                title,
                description,
                targetLang: targetLocale,
              }),
            });

            if (translateRes.ok) {
              const translated = await translateRes.json();
              const translatedFrontmatter = {
                ...frontmatter,
                title: translated.title || title,
                description: translated.description || description,
              };
              const translatedContent = matter.stringify(
                translated.content || content,
                translatedFrontmatter
              );
              const targetDir = path.join(process.cwd(), 'src/content/blog', targetLocale);
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
              }
              fs.writeFileSync(
                path.join(targetDir, `${slug}.md`),
                translatedContent,
                'utf8'
              );
            }
          } catch (error) {
            console.error(`Translation to ${targetLocale} failed:`, error);
          }
        }
      }
    }

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
