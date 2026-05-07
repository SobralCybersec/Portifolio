import { calculateReadTime, formatDate, slugify } from '@/lib/blog';

describe('Blog Utilities', () => {
  describe('calculateReadTime', () => {
    it('calculates read time for short content', () => {
      const content = 'This is a short test content with few words.';
      const readTime = calculateReadTime(content);
      expect(readTime).toBe(1);
    });

    it('calculates read time for long content', () => {
      const content = 'word '.repeat(500);
      const readTime = calculateReadTime(content);
      expect(readTime).toBeGreaterThan(1);
    });

    it('handles empty content', () => {
      const readTime = calculateReadTime('');
      expect(readTime).toBe(1);
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = '2025-01-15';
      const formatted = formatDate(date);
      expect(formatted).toMatch(/January|Janeiro|Enero/);
    });

    it('handles invalid date', () => {
      const formatted = formatDate('invalid-date');
      expect(formatted).toBe('Invalid Date');
    });
  });

  describe('slugify', () => {
    it('converts title to slug', () => {
      const slug = slugify('Hello World Test');
      expect(slug).toBe('hello-world-test');
    });

    it('handles special characters', () => {
      const slug = slugify('Test & Special! Characters?');
      expect(slug).toBe('test-special-characters');
    });

    it('handles multiple spaces', () => {
      const slug = slugify('Multiple   Spaces   Here');
      expect(slug).toBe('multiple-spaces-here');
    });
  });
});
