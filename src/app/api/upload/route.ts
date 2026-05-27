import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

/** Allowed image/video MIME types for uploads. */
const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif',
  'video/mp4', 'video/webm',
]);

/** Allowed file extensions (must match MIME allowlist). */
const ALLOWED_EXT = /\.(jpe?g|png|gif|webp|avif|mp4|webm)$/i;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    // CWE-22: strip all directory components — only keep the bare filename
    const safeName = path.basename(file.name.replace(/\s/g, '-'));

    // Validate extension against allowlist
    if (!ALLOWED_EXT.test(safeName)) {
      return NextResponse.json({ error: 'File extension not allowed' }, { status: 400 });
    }

    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const filename = `${Date.now()}-${safeName}`;
    const filepath = path.resolve(uploadsDir, filename);

    // Final containment check — resolved path must stay inside uploadsDir
    if (!filepath.startsWith(uploadsDir + path.sep)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    return NextResponse.json({ url: `/uploads/${filename}`, filename });
  } catch (error) {
    console.error('Upload error:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
