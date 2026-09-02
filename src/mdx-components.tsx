import type { MDXComponents } from 'mdx/types';
import { blogMdxComponents } from '@/components/blog/BlogComponents';

export function useMDXComponents(): MDXComponents {
  return blogMdxComponents;
}
