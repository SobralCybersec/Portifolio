'use client';
/* eslint-disable @next/next/no-img-element */

import { ArrowRight, Clock, Plus, X, Upload, FileUp, Link as LinkIcon, Globe, Eye } from 'lucide-react';
import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import { useClickSound } from '@/hooks/useClickSound';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import type { BlogPost } from '@/lib/blog';
import { useDropzone } from 'react-dropzone';

const HexagonGrid = dynamic(() => import('@/components/HexagonGrid'), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/ParticleBackground'), { ssr: false });
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import matter from 'gray-matter';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPage() {
  useClickSound();
  const { theme } = useTheme();
  const t = useTranslations('blog');
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'en';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const loadPosts = useCallback(() => {
    fetch(`/api/blog/list?locale=${locale}`)
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [locale]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: async (files) => {
      const file = files[0];
      if (file) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          if (res.ok) {
            const data = await res.json();
            if (data.url) setCoverImage(data.url);
          }
        } catch (error) {
          console.error('Cover upload failed:', error);
        }
      }
    },
  });

  const { getRootProps: getMdRootProps, getInputProps: getMdInputProps } = useDropzone({
    accept: { 'text/markdown': ['.md', '.mdx'], 'text/plain': ['.txt'] },
    maxFiles: 1,
    onDrop: async (files) => {
      const file = files[0];
      if (file) {
        try {
          const text = await file.text();
          const { data: frontmatter, content: markdownContent } = matter(text);
          const cleanContent = markdownContent
            .replace(/&gt;/g, '>')
            .replace(/&lt;/g, '<')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .trim();
          setTitle(frontmatter.title || '');
          setDescription(frontmatter.description || '');
          setCategory(frontmatter.category || 'Web Development');
          setTags(Array.isArray(frontmatter.tags) ? frontmatter.tags.join(', ') : frontmatter.tags || '');
          setCoverImage(frontmatter.coverImage || frontmatter.image || '');
          setContent(cleanContent);
        } catch (error) {
          console.error('Failed to parse markdown:', error);
        }
      }
    },
  });

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    if (!data.url) throw new Error('No URL returned');
    return data.url;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const post = {
        title,
        description,
        category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        content,
        coverImage,
        locale,
        autoTranslate,
      };

      const res = await fetch('/api/blog/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });

      if (res.ok) {
        const { slug } = await res.json();
        setShowModal(false);
        setTitle('');
        setDescription('');
        setCategory('Web Development');
        setTags('');
        setContent('');
        setCoverImage('');
        setAutoTranslate(false);
        loadPosts();
        router.push(`/blog/${slug}`);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setCreating(false);
    }
  };

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
      <div className="blog-page-wrapper relative">
        <ParticleBackground />

        <div className="blog-hero-section relative z-10">
          <div className="blog-hero-inner">
            <p className="blog-hero-eyebrow">{t('eyebrow')}</p>
            <h1 className="blog-hero-title">{t('title')}</h1>
            <p className="blog-hero-subtitle">
              {t('subtitle')}
            </p>
          </div>
        </div>

        <div className="blog-list-wrapper relative z-10">
          <div className="blog-list-inner">
            {loading ? (
              <p className="text-center text-gray-400">Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="text-center text-gray-400">No posts yet. Create your first post!</p>
            ) : (
              posts.map((post, index) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className={`blog-article-row ${index === 0 ? 'blog-article-row-first' : ''}`}
                >
                  <article className="blog-article-content">
                    <div className="blog-article-meta">
                      <time dateTime={post.date} className="blog-article-date">
                        {formatDate(post.date)}
                      </time>
                      <ArrowRight className="blog-article-arrow" />
                    </div>

                    <h2 className="blog-article-title">{post.title}</h2>
                    <p className="blog-article-desc">{post.description}</p>

                    {post.coverImage && (
                      <div className="blog-article-image my-4">
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

                    <div className="blog-article-footer">
                      <span className="blog-article-tag">{post.category}</span>
                      <span className="blog-article-read">
                        <Clock className="w-3 h-3" />
                        {post.readTime} {t('readTime')}
                      </span>
                    </div>
                  </article>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          aria-label={t('createPost')}
        >
          <Plus className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Create Post Modal */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl my-8 border border-purple-500/20">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {t('newPost')}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    {showPreview ? t('hidePreview') : t('showPreview')} {t('preview')}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCreate} className="p-6">
                <div className={`grid ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
                  {/* Editor Column */}
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Import Markdown */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-purple-400">{t('importMarkdown')}</label>
                      <div
                        {...getMdRootProps()}
                        className="border-2 border-dashed border-blue-700 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-all bg-blue-900/20"
                      >
                        <input {...getMdInputProps()} />
                        <FileUp className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                        <p className="text-blue-400 text-sm font-medium">{t('dropMarkdown')}</p>
                        <p className="text-gray-500 text-xs mt-1">{t('autoFills')}</p>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-purple-400">{t('postTitle')}</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder={t('enterPostTitle')}
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-purple-400">{t('postDescription')}</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={2}
                        placeholder={t('briefDescription')}
                        required
                      />
                    </div>

                    {/* Category & Tags */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-purple-400">{t('postCategory')}</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="Web Development">{t('categories.webDevelopment')}</option>
                          <option value="Cybersecurity">{t('categories.cybersecurity')}</option>
                          <option value="DevOps">{t('categories.devops')}</option>
                          <option value="Cloud Computing">{t('categories.cloudComputing')}</option>
                          <option value="Programming">{t('categories.programming')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-purple-400">{t('postTags')}</label>
                        <input
                          type="text"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="react, typescript"
                        />
                      </div>
                    </div>

                    {/* Cover Image */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-purple-400">{t('postCoverImage')}</label>
                      <div
                        {...getCoverRootProps()}
                        className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-all bg-gray-900/30"
                      >
                        <input {...getCoverInputProps()} />
                        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-500" />
                        {coverImage ? (
                          <p className="text-green-400 text-sm">{t('imageUploaded')}</p>
                        ) : (
                          <p className="text-gray-400 text-sm">{t('dragDropUpload')}</p>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-purple-400">{t('postContent')}</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const link = prompt(t('enterUrl'));
                              if (link) {
                                const text = prompt(t('enterLinkText'));
                                setContent(content + `\n[${text || link}](${link})`);
                              }
                            }}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded text-xs transition-all"
                          >
                            <LinkIcon className="w-3 h-3" />
                            {t('linkButton')}
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = async (e: any) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const url = await handleImageUpload(file);
                                    setContent(content + `\n![${file.name}](${url})`);
                                  } catch (error) {
                                    alert(t('uploadFailed'));
                                  }
                                }
                              };
                              input.click();
                            }}
                            className="flex items-center gap-1 px-2 py-1 bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 rounded text-xs transition-all"
                          >
                            <Upload className="w-3 h-3" />
                            {t('imageButton')}
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                        rows={15}
                        placeholder={t('yourPostContent')}
                        required
                      />
                    </div>

                    {/* Auto-translate */}
                    <div className="flex items-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        id="autoTranslate"
                        checked={autoTranslate}
                        onChange={(e) => setAutoTranslate(e.target.checked)}
                        className="w-5 h-5"
                      />
                      <label htmlFor="autoTranslate" className="flex items-center gap-2 cursor-pointer text-sm">
                        <Globe className="w-5 h-5 text-purple-400" />
                        <span>{t('autoTranslate')}</span>
                      </label>
                    </div>
                  </div>

                  {/* Preview Column */}
                  {showPreview && (
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                      <div className="sticky top-0 bg-gray-900 pb-2 z-10">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                          {t('livePreview')}
                        </h3>
                      </div>
                      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                        {coverImage && (
                          <div className="mb-6 rounded-lg overflow-hidden">
                            <Image 
                              src={coverImage} 
                              alt={title || 'Cover'}
                              className="w-full h-auto object-contain rounded-lg"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          </div>
                        )}
                        <div className="mb-4">
                          <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm">
                            {category || t('category')}
                          </span>
                        </div>
                        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                          {title || t('postTitlePreview')}
                        </h1>
                        <p className="text-gray-400 mb-6">
                          {description || t('postDescriptionPreview')}
                        </p>
                        <div className="prose prose-invert prose-lg max-w-none">
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
                                    <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
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
                                return <Image src={src} alt={alt} className="rounded-lg max-w-full h-auto my-8" {...props} />;
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
                                return <thead className="bg-gray-800" {...props}>{children}</thead>;
                              },
                              tbody({ node, children, ...props }: any) {
                                return <tbody className="divide-y divide-gray-700" {...props}>{children}</tbody>;
                              },
                              th({ node, children, ...props }: any) {
                                return <th className="px-4 py-3 text-left text-sm font-semibold text-white" {...props}>{children}</th>;
                              },
                              td({ node, children, ...props }: any) {
                                return <td className="px-4 py-3 text-sm text-gray-300" {...props}>{children}</td>;
                              },
                              hr({ node, ...props }: any) {
                                return <hr className="my-8 border-gray-700" {...props} />;
                              },
                            }}
                          >
                            {content || `*${t('startTyping')}*`}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t border-gray-800 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !title || !content}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20"
                  >
                    {creating ? t('creating') : t('create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
