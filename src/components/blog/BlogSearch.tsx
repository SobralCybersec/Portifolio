'use client';

import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { BlogMonthGroup } from '@/lib/blog/types';
import FilterDropdown from '@/components/ui/FilterDropdown';
import { STACK_FILTERS } from '@/lib/github/languageIcon';
import { BlogMonthList } from './BlogUI';

type BlogSearchProps = {
  groups: BlogMonthGroup[];
  locale: string;
  placeholder: string;
  emptyMessage: string;
  stackLabel: string;
  allStackLabel: string;
};

function normalizeSearchText(value: string): string {
  return value.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function compactSearchText(value: string): string {
  return normalizeSearchText(value).replace(/[^\p{L}\p{N}]/gu, '');
}

function matchesSearch(post: BlogMonthGroup['posts'][number], query: string): boolean {
  const text = normalizeSearchText([post.title, post.description, ...post.tags, ...(post.categories ?? []), post.searchText ?? ''].join(' '));
  return text.includes(query) || compactSearchText(text).includes(compactSearchText(query));
}

function stackKey(value: string): string {
  return compactSearchText(value);
}

export default function BlogSearch({ groups, locale, placeholder, emptyMessage, stackLabel, allStackLabel }: BlogSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedStack, setSelectedStack] = useState('all');
  const normalizedQuery = normalizeSearchText(query.trim());
  const stackOptions = useMemo(() => {
    return [
      { id: 'all', label: allStackLabel },
      ...STACK_FILTERS,
    ];
  }, [allStackLabel]);
  const selectedStackKeys = useMemo(() => {
    const selectedOption = stackOptions.find((option) => option.id === selectedStack);
    return new Set([selectedStack, ...(selectedOption?.aliases ?? [])].map(stackKey));
  }, [selectedStack, stackOptions]);
  const filteredGroups = useMemo(() => {
    if (!normalizedQuery && selectedStack === 'all') return groups;

    return groups
      .map((group) => ({
        ...group,
        posts: group.posts.filter((post) => {
          const postStacks = new Set([...post.tags, ...(post.categories ?? [])].map(stackKey));
          const matchesStack = selectedStack === 'all' || [...selectedStackKeys].some((key) => postStacks.has(key));
          return matchesStack && (!normalizedQuery || matchesSearch(post, normalizedQuery));
        }),
      }))
      .filter((group) => group.posts.length > 0);
  }, [groups, normalizedQuery, selectedStack, selectedStackKeys]);

  return (
    <>
      <div className="blog-search">
        <div className="blog-search__row">
          <FilterDropdown options={stackOptions} selected={selectedStack} onChange={setSelectedStack} placeholder={stackLabel} />
          <div className="blog-search__control">
            <Search className="blog-search__icon" size={17} aria-hidden="true" />
            <input
              id="blog-search-input"
              aria-label={placeholder}
              className="blog-search__input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              autoComplete="off"
            />
            {query && (
              <button type="button" className="blog-search__clear" onClick={() => setQuery('')} aria-label="Clear search">
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
      {filteredGroups.length > 0 ? <BlogMonthList groups={filteredGroups} locale={locale} /> : <p className="blog-search__empty">{emptyMessage}</p>}
    </>
  );
}
