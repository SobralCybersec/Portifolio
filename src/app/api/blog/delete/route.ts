import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { getSupportedLocales } from '@/lib/translate';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const locale = searchParams.get('locale') || 'all';

    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    }

    const locales = locale === 'all' ? getSupportedLocales() : [locale];
    const deleted: string[] = [];

    for (const loc of locales) {
      const mdPath = path.join(process.cwd(), 'src', 'content', 'blog', loc, `${slug}.md`);
      const mdxPath = path.join(process.cwd(), 'src', 'content', 'blog', loc, `${slug}.mdx`);

      if (existsSync(mdPath)) {
        await unlink(mdPath);
        deleted.push(`${loc}/${slug}.md`);
      }

      if (existsSync(mdxPath)) {
        await unlink(mdxPath);
        deleted.push(`${loc}/${slug}.mdx`);
      }
    }

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      deleted,
      message: `Deleted ${deleted.length} file(s)`
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
