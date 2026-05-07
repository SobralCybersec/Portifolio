'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Upload, Save, Globe, FileText, Trash2, Edit, List, Eye, FileUp, Link as LinkIcon } from 'lucide-react';
import { BlogPost } from '@/lib/blog';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import matter from 'gray-matter';
import remarkGfm from 'remark-gfm';

export default function BlogAdminClient() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [mode, setMode] = useState<'create' | 'edit' | 'list'>('list');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const res = await fetch(`/api/blog/list?locale=${locale}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: async (files) => {
      const file = files[0];
      if (file) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!res.ok) {
            throw new Error('Upload failed');
          }
          
          const data = await res.json();
          if (data.url) {
            setCoverImage(data.url);
          }
        } catch (error) {
          console.error('Cover image upload failed:', error);
          alert('Failed to upload cover image. Please try again.');
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
          
          // Decode HTML entities if present
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
          setCategory(frontmatter.category || '');
          setTags(Array.isArray(frontmatter.tags) ? frontmatter.tags.join(', ') : frontmatter.tags || '');
          setCoverImage(frontmatter.coverImage || frontmatter.image || '');
          setContent(cleanContent);
        } catch (error) {
          console.error('Failed to parse markdown file:', error);
          alert('Failed to parse markdown file. Please check the format.');
        }
      }
    },
  });

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload failed: ${res.status} ${errorText}`);
      }
      
      const data = await res.json();
      
      if (!data.url) {
        throw new Error('No URL returned from upload');
      }
      
      return data.url;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    const post = {
      slug: editingPost?.slug,
      title,
      description,
      category,
      tags: tags.split(',').map(t => t.trim()),
      content,
      coverImage,
      date: editingPost?.date || new Date().toISOString(),
      autoTranslate,
    };

    const endpoint = mode === 'edit' ? '/api/blog/update' : '/api/blog/create';
    const method = mode === 'edit' ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });

      if (res.ok) {
        await loadPosts();
        resetForm();
        setMode('list');
      } else {
        const error = await res.json();
        alert(`Failed to save: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save post');
    }
    
    setSaving(false);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setDescription(post.description);
    setCategory(post.category);
    setTags(post.tags?.join(', ') || '');
    setContent(post.content);
    setCoverImage(post.coverImage || '');
    setMode('edit');
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const res = await fetch(`/api/blog/delete?slug=${slug}&locale=all`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await loadPosts();
      } else {
        const error = await res.json();
        alert(`Failed to delete: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete post');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setTags('');
    setContent('');
    setCoverImage('');
    setAutoTranslate(false);
    setEditingPost(null);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {mode === 'list' ? 'Manage Posts' : mode === 'edit' ? 'Edit Post' : 'Create Post'}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setMode('list'); resetForm(); }}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                mode === 'list' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/50' 
                  : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setMode('create'); resetForm(); }}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                mode === 'create' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/50' 
                  : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700'
              }`}
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>
        </div>

        {mode === 'list' ? (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No posts yet. Create your first post!
              </div>
            ) : (
              posts.map(post => (
                <div key={post.slug} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{post.title}</h3>
                      <p className="text-gray-400 mb-4">{post.description}</p>
                      <div className="flex gap-2 text-sm text-gray-500">
                        <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400">{post.category}</span>
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                        <span>{post.readTime} min read</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                      >
                        <Edit className="w-5 h-5 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.slug)}
                        className="p-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-400">Import Markdown File</label>
                <div
                  {...getMdRootProps()}
                  className="border-2 border-dashed border-blue-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-all duration-300 bg-blue-900/20"
                >
                  <input {...getMdInputProps()} />
                  <FileUp className="w-10 h-10 mx-auto mb-3 text-blue-400" />
                  <p className="text-blue-400 font-medium">Drop .md or .mdx file here</p>
                  <p className="text-gray-500 text-sm mt-1">Auto-fills title, description, and content</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-purple-400">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Enter post title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-purple-400">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  rows={3}
                  placeholder="Brief description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-400">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="e.g., Next.js"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-400">Tags</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="react, typescript"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-purple-400">Cover Image</label>
                <div
                  {...getCoverRootProps()}
                  className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-all duration-300 bg-gray-900/30"
                >
                  <input {...getCoverInputProps()} />
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                  {coverImage ? (
                    <p className="text-green-400">Image uploaded!</p>
                  ) : (
                    <p className="text-gray-400">Drag & drop or click to upload</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-purple-400">Content (Markdown)</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const link = prompt('Enter URL:');
                        if (link) {
                          const text = prompt('Enter link text (optional):');
                          setContent(content + `\n[${text || link}](${link})`);
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded text-xs transition-all"
                    >
                      <LinkIcon className="w-3 h-3" />
                      Link
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
                              alert('Failed to upload image');
                            }
                          }
                        };
                        input.click();
                      }}
                      className="flex items-center gap-1 px-2 py-1 bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 rounded text-xs transition-all"
                    >
                      <Upload className="w-3 h-3" />
                      Image
                    </button>
                  </div>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors font-mono text-sm"
                  rows={20}
                  placeholder="Write your markdown content here...\n\n# Heading\n\n**bold** *italic*\n\n- List item\n\n[Link](https://example.com)\n\n![Image](url)\n\n\`\`\`javascript\ncode block\n\`\`\`"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                <input
                  type="checkbox"
                  id="autoTranslate"
                  checked={autoTranslate}
                  onChange={(e) => setAutoTranslate(e.target.checked)}
                  className="w-5 h-5"
                />
                <label htmlFor="autoTranslate" className="flex items-center gap-2 cursor-pointer">
                  <Globe className="w-5 h-5 text-purple-400" />
                  <span>Auto-translate to all languages</span>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving || !title || !content}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : mode === 'edit' ? 'Update Post' : 'Publish Post'}
                </button>
                <button
                  onClick={() => { setMode('list'); resetForm(); }}
                  className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Preview Column */}
            <div className="space-y-6">
              <div className="sticky top-32">
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Live Preview</h2>
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                  {coverImage && (
                    <div className="mb-6 rounded-lg overflow-hidden">
                      <img 
                        src={coverImage} 
                        alt={title || 'Cover'}
                        className="w-full h-auto object-contain rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm">
                      {category || 'Category'}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {title || 'Post Title'}
                  </h1>
                  <p className="text-gray-400 mb-6">
                    {description || 'Post description will appear here...'}
                  </p>
                  <div className="prose prose-invert prose-lg max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p({ node, children, ...props }: any) {
                          return <p className="mb-6 leading-relaxed" {...props}>{children}</p>;
                        },
                        h1({ node, children, ...props }: any) {
                          return <h1 className="text-4xl font-bold mt-12 mb-6 text-white" {...props}>{children}</h1>;
                        },
                        h2({ node, children, ...props }: any) {
                          return <h2 className="text-3xl font-bold mt-10 mb-5 text-white" {...props}>{children}</h2>;
                        },
                        h3({ node, children, ...props }: any) {
                          return <h3 className="text-2xl font-semibold mt-8 mb-4 text-white" {...props}>{children}</h3>;
                        },
                        ul({ node, children, ...props }: any) {
                          return <ul className="list-disc list-inside mb-6 space-y-2" {...props}>{children}</ul>;
                        },
                        ol({ node, children, ...props }: any) {
                          return <ol className="list-decimal list-inside mb-6 space-y-2" {...props}>{children}</ol>;
                        },
                        li({ node, children, ...props }: any) {
                          return <li className="mb-2 leading-relaxed" {...props}>{children}</li>;
                        },
                        blockquote({ node, children, ...props }: any) {
                          return <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-6 italic text-gray-300" {...props}>{children}</blockquote>;
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
                            <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm text-purple-300" {...props}>{children}</code>
                          );
                        },
                        a({ node, children, href, ...props }: any) {
                          return <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline" {...props}>{children}</a>;
                        },
                        img({ node, src, alt, ...props }: any) {
                          return <img src={src} alt={alt} className="rounded-lg max-w-full h-auto my-8" {...props} />;
                        },
                        table({ node, children, ...props }: any) {
                          return <div className="overflow-x-auto my-6"><table className="min-w-full border border-gray-700" {...props}>{children}</table></div>;
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
                      {content || '*Start typing to see preview...*'}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
