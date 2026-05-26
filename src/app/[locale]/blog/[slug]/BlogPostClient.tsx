'use client';
/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import { useTheme } from 'next-themes';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { BlogPost } from '@/lib/blog';

const HexagonGrid = dynamic(() => import('@/components/HexagonGrid'), { ssr: false });
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPostClient({ post }: { post: BlogPost }) {
  const { theme } = useTheme();

  return (
    <>
      <Navigation />
      <div className="page-grid-overlay" />
      {theme === 'dark' && (
        <div className="fixed inset-0 -z-[2] pointer-events-none">
          <HexagonGrid 
            cellSize={60} 
            glowColor="rgba(168, 85, 247, 0.6)" 
            lineColor="rgba(168, 85, 247, 0.08)"
            glowInterval={150}
            maxSimultaneous={6}
          />
        </div>
      )}
      <div className="blog-post-wrapper">
        <div className="blog-post-inner">

          <div className="blog-post-back-row">
            <Link href="/blog" className="blog-post-back">
              <ArrowLeft className="w-4 h-4" />
              Back to blog
            </Link>
          </div>

          <div className="blog-post-header">
            <div className="blog-post-meta-row">
              <span className="blog-post-category">{post.category}</span>
              <span className="blog-post-meta-sep">·</span>
              <time dateTime={post.date} className="blog-post-date">{formatDate(post.date)}</time>
              <span className="blog-post-meta-sep">·</span>
              <span className="blog-post-read">
                <Clock className="w-3 h-3" />
                {post.readTime} min read
              </span>
            </div>

            <h1 className="blog-post-title">{post.title}</h1>
            <p className="blog-post-description">{post.description}</p>

            {post.coverImage && (
              <div className="my-8 rounded-lg overflow-hidden">
                <Image 
                  src={post.coverImage} 
                  alt={post.title}
                  className="w-full h-auto object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="blog-post-author">
              <div className="blog-post-author-avatar">MS</div>
              <div>
                <div className="blog-post-author-name">{post.author || 'Matheus Sobral'}</div>
                <div className="blog-post-author-role">Full-Stack Developer</div>
              </div>
            </div>
          </div>

          <div className="blog-post-body">
            <div className="blog-post-content prose prose-invert prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p({ node, children, ...props }: any) {
                    return (
                      <p className="mb-6 leading-relaxed" {...props}>
                        {children}
                      </p>
                    );
                  },
                  h1({ node, children, ...props }: any) {
                    return (
                      <h1 className="text-4xl font-bold mt-12 mb-6 text-white" {...props}>
                        {children}
                      </h1>
                    );
                  },
                  h2({ node, children, ...props }: any) {
                    return (
                      <h2 className="text-3xl font-bold mt-10 mb-5 text-white" {...props}>
                        {children}
                      </h2>
                    );
                  },
                  h3({ node, children, ...props }: any) {
                    return (
                      <h3 className="text-2xl font-semibold mt-8 mb-4 text-white" {...props}>
                        {children}
                      </h3>
                    );
                  },
                  ul({ node, children, ...props }: any) {
                    return (
                      <ul className="list-disc list-inside mb-6 space-y-2" {...props}>
                        {children}
                      </ul>
                    );
                  },
                  ol({ node, children, ...props }: any) {
                    return (
                      <ol className="list-decimal list-inside mb-6 space-y-2" {...props}>
                        {children}
                      </ol>
                    );
                  },
                  li({ node, children, ...props }: any) {
                    return (
                      <li className="mb-2 leading-relaxed" {...props}>
                        {children}
                      </li>
                    );
                  },
                  blockquote({ node, children, ...props }: any) {
                    return (
                      <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-6 italic text-gray-300" {...props}>
                        {children}
                      </blockquote>
                    );
                  },
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="my-6">
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm text-purple-300" {...props}>
                        {children}
                      </code>
                    );
                  },
                  a({ node, children, href, ...props }: any) {
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline" {...props}>
                        {children}
                      </a>
                    );
                  },
                  img({ node, src, alt, ...props }: any) {
                    return (
                      <Image src={src} alt={alt} className="rounded-lg max-w-full h-auto my-8" {...props} />
                    );
                  },
                  table({ node, children, ...props }: any) {
                    return (
                      <div className="overflow-x-auto my-6">
                        <table className="min-w-full border border-gray-700" {...props}>
                          {children}
                        </table>
                      </div>
                    );
                  },
                  thead({ node, children, ...props }: any) {
                    return (
                      <thead className="bg-gray-800" {...props}>
                        {children}
                      </thead>
                    );
                  },
                  tbody({ node, children, ...props }: any) {
                    return (
                      <tbody className="divide-y divide-gray-700" {...props}>
                        {children}
                      </tbody>
                    );
                  },
                  tr({ node, children, ...props }: any) {
                    return (
                      <tr {...props}>
                        {children}
                      </tr>
                    );
                  },
                  th({ node, children, ...props }: any) {
                    return (
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white" {...props}>
                        {children}
                      </th>
                    );
                  },
                  td({ node, children, ...props }: any) {
                    return (
                      <td className="px-4 py-3 text-sm text-gray-300" {...props}>
                        {children}
                      </td>
                    );
                  },
                  hr({ node, ...props }: any) {
                    return (
                      <hr className="my-8 border-gray-700" {...props} />
                    );
                  },
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
