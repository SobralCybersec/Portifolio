/** Allow only https://github.com/* URLs — blocks javascript: and data: XSS vectors (CWE-79). */
export function safeGithubUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' && parsed.hostname === 'github.com') return url;
  } catch {}
  return null;
}

/** Allow only https: URLs for external links (homepage, demo). */
export function safeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:') return url;
  } catch {}
  return null;
}
