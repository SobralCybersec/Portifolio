<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Blog Architecture

- Content source: `content/blog/YYYY/MM/DD/slug/index.mdx`; optional English sibling: `index.en.mdx`.
- Media source: `public/blog/YYYY/MM/DD/slug/`; keep public URLs aligned with bundle paths.
- Required front matter: `title`, concrete `description`, ISO `date`, `tags`, and boolean `draft`.
- Optional front matter: `updated`, `pinned`, `cover`, `translationKey`; `typora-*` keys are editor-only.
- Tags must exist in `data/blog-tags.yml` using canonical lowercase slugs.
- `pnpm blog:new "Article title"` creates content and asset directories without overwriting.
- `pnpm blog:validate` checks metadata, paths, tags, local covers, image alt text, siblings, and MDX compilation.
- `pnpm blog:publish` validates, stages only editorial paths, commits, and pushes configured upstream; use `--no-push` for local verification.
- `pnpm blog:auto` watches editorial paths, debounces saves for 30 seconds, then validates and publishes one operation at a time.
- Drafts and future posts appear in development only; production index, archive, tags, RSS, sitemap, and chronology use published posts.
