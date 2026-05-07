import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { translateText, translateBlogPost } from '../src/lib/translate';
import { getAllPosts, getPostBySlug } from '../src/lib/blog';
import fs from 'fs';
import path from 'path';

describe('Blog Translation', () => {
  it('should translate simple text', async () => {
    const result = await translateText('Hello', 'es', 'en');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  }, 30000);

  it('should return same text for same locale', async () => {
    const text = 'Hello World';
    const result = await translateText(text, 'en', 'en');
    expect(result).toBe(text);
  });

  it('should translate blog post frontmatter', async () => {
    const content = 'This is a test post content.';
    const frontmatter = {
      title: 'Test Post',
      description: 'A test description',
      category: 'Testing',
    };

    const result = await translateBlogPost(content, frontmatter, 'es', 'en');
    
    expect(result.frontmatter.title).toBeTruthy();
    expect(result.frontmatter.description).toBeTruthy();
    expect(result.content).toBeTruthy();
  }, 30000);

  it('should preserve code blocks during translation', async () => {
    const content = `
# Hello

\`\`\`javascript
const test = 'code';
\`\`\`

This is text.
    `;

    const result = await translateBlogPost(content, {}, 'es', 'en');
    expect(result.content).toContain('```javascript');
    expect(result.content).toContain("const test = 'code';");
  }, 30000);
});

describe('Blog CRUD Operations', () => {
  const testPostPath = path.join(process.cwd(), 'src/content/blog/en/test-post.md');

  beforeEach(() => {
    if (fs.existsSync(testPostPath)) {
      fs.unlinkSync(testPostPath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testPostPath)) {
      fs.unlinkSync(testPostPath);
    }
  });

  it('should create a blog post', () => {
    const content = `---
title: Test Post
description: Test description
category: Testing
tags:
  - test
date: 2026-01-01
readTime: 1
---

# Test Content

This is a test post.
`;

    fs.writeFileSync(testPostPath, content, 'utf-8');
    expect(fs.existsSync(testPostPath)).toBe(true);
  });

  it('should read blog posts', () => {
    const content = `---
title: Test Post
description: Test description
category: Testing
date: 2026-01-01
readTime: 1
---

Test content
`;

    fs.writeFileSync(testPostPath, content, 'utf-8');

    const posts = getAllPosts('en');
    const testPost = posts.find(p => p.slug === 'test-post');
    
    expect(testPost).toBeDefined();
    expect(testPost?.title).toBe('Test Post');
    expect(testPost?.description).toBe('Test description');
  });

  it('should get post by slug', () => {
    const content = `---
title: Test Post
description: Test description
category: Testing
date: 2026-01-01
readTime: 1
---

Test content
`;

    fs.writeFileSync(testPostPath, content, 'utf-8');

    const post = getPostBySlug('test-post', 'en');
    
    expect(post).not.toBeNull();
    expect(post?.title).toBe('Test Post');
    expect(post?.slug).toBe('test-post');
  });

  it('should return null for non-existent post', () => {
    const post = getPostBySlug('non-existent-post', 'en');
    expect(post).toBeNull();
  });

  it('should delete a blog post', () => {
    const content = `---
title: Test Post
description: Test description
category: Testing
date: 2026-01-01
readTime: 1
---

Test content
`;

    fs.writeFileSync(testPostPath, content, 'utf-8');
    expect(fs.existsSync(testPostPath)).toBe(true);

    fs.unlinkSync(testPostPath);
    expect(fs.existsSync(testPostPath)).toBe(false);
  });
});
