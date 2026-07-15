import { NextRequest, NextResponse } from 'next/server';
import { getLanguageImage } from '@/lib/languageIcon';

const GITHUB_USERNAMES = ['SobralCybersec', 'MatheusSobralCSharp'];
const SORT_BY = 'updated';
const REPO_TYPE = 'owner';

/**
 * GitHub usernames and repo names only allow [a-zA-Z0-9._-] and are
 * max 100 chars. Validate before interpolating into API URLs (CWE-918).
 */
const GITHUB_SLUG_RE = /^[a-zA-Z0-9._-]{1,100}$/;

function assertSafeSlug(value: string, label: string): void {
  if (!GITHUB_SLUG_RE.test(value)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
}

function extractTechStack(readmeContent: string): string[] {
  const techStack = new Set<string>();

  const techPatterns: Record<string, RegExp[]> = {
    'React': [/react/i], 'Next.js': [/next\.js/i, /nextjs/i],
    'Vue': [/vue/i], 'Angular': [/angular/i],
    'Node.js': [/node\.js/i, /nodejs/i], 'Express': [/express/i],
    'TypeScript': [/typescript/i], 'JavaScript': [/javascript/i],
    'Python': [/python/i], 'Django': [/django/i], 'Flask': [/flask/i],
    'FastAPI': [/fastapi/i], 'Java': [/\bjava\b/i], 'Spring': [/spring/i],
    'Go': [/\bgolang\b/i], 'Rust': [/\brust\b/i],
    'C++': [/c\+\+/i, /cpp/i], 'C#': [/c#/i, /csharp/i],
    'MongoDB': [/mongodb/i], 'PostgreSQL': [/postgresql/i, /postgres/i],
    'MySQL': [/mysql/i], 'Redis': [/redis/i], 'Docker': [/docker/i],
    'Kubernetes': [/kubernetes/i, /k8s/i], 'AWS': [/\baws\b/i],
    'Tailwind': [/tailwind/i], 'GraphQL': [/graphql/i],
    'REST API': [/rest api/i, /restful/i], 'JWT': [/\bjwt\b/i],
  };

  Object.entries(techPatterns).forEach(([tech, patterns]) => {
    if (patterns.some(p => p.test(readmeContent))) techStack.add(tech);
  });

  const badgeRegex = /!\[.*?\]\(https:\/\/img\.shields\.io\/badge\/(.*?)\)/gi;
  for (const match of readmeContent.matchAll(badgeRegex)) {
    const badgeText = match[1].split('-')[0].replace(/%20/g, ' ');
    if (badgeText.length > 2 && badgeText.length < 20) techStack.add(badgeText);
  }

  return Array.from(techStack).slice(0, 8);
}

async function fetchReadmeData(
  owner: string,
  repo: string,
  headers: HeadersInit
): Promise<{ previewImage: string | null; isVideo: boolean; techStack: string[] }> {
  try {
    assertSafeSlug(owner, 'owner');
    assertSafeSlug(repo, 'repo');

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          ...headers,
          'Accept': 'application/vnd.github.v3.raw',
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) return { previewImage: null, isVideo: false, techStack: [] };

    const readme = await res.text();
    const techStack = extractTechStack(readme);

    // Manual configurations for specific projects
    const isFIAP = repo.toLowerCase().includes('fiap');
    const isJavaDoZero = repo.toLowerCase() === 'javadozero';
    const isJJKUR = repo.toLowerCase() === 'jjkur' || repo.toLowerCase() === 'jujutsukaisenultimatereworked' || repo.toLowerCase() === 'jjku';
    
    if (isFIAP) {
      return { 
        previewImage: 'https://www.fiap.com.br/wp-content/themes/fiap2016/images/sharing/fiap.png', 
        isVideo: false, 
        techStack 
      };
    }

    if (isJavaDoZero) {
      return {
        previewImage: 'https://i.imgur.com/oOn2P0s.png',
        isVideo: false,
        techStack
      };
    }

    if (isJJKUR) {
      return {
        previewImage: JSON.stringify([
          'https://media.forgecdn.net/attachments/1063/600/captura-de-tela-2025-01-11-091355.png',
          'https://media.forgecdn.net/attachments/1063/597/image-1.png',
          'https://media.forgecdn.net/attachments/1063/599/captura-de-tela-2025-01-11-090958.png',
          'https://media.forgecdn.net/attachments/1063/598/image-2.png',
          'https://media.forgecdn.net/attachments/1063/601/captura-de-tela-2025-01-11-090439.png',
          'https://media.forgecdn.net/attachments/1063/602/captura-de-tela-2025-01-11-090634.png'
        ]),
        isVideo: false,
        techStack
      };
    }
    
    const demoIdx = readme.search(/(demonstration|demo|demonstração)/i);
    const content = demoIdx !== -1 && !isFIAP ? readme.slice(demoIdx) : readme;

    // Extract all images from demonstration section
    const images: string[] = [];
    const videos: string[] = [];

    // Check for videos first
    const videoMatches = content.matchAll(/https:\/\/github\.com\/user-attachments\/assets\/[a-f0-9-]+/gi);
    for (const match of videoMatches) {
      videos.push(match[0]);
    }

    // Extract videos from HTML <video>/<source> tags. GitHub renders these
    // inline, but without parsing them a readme that embeds a
    // `<video src="...mp4">` produced NO preview and — since the card now
    // defaults empty previews to the language icon — the video was silently
    // overridden by the language icon. Capturing them here keeps isVideo true.
    for (const tag of content.matchAll(/<(?:video|source)\b[^>]*>/gi)) {
      const src = tag[0].match(/(?:src|data-canonical-src)=["']([^"']+)["']/i)?.[1];
      if (src) videos.push(src);
    }

    // Extract from HTML img tags
    for (const imgTag of content.matchAll(/<img[^>]*>/gi)) {
      const tag = imgTag[0];
      const widthMatch = tag.match(/width=["']?(\d+)["']?/i);
      if (widthMatch && parseInt(widthMatch[1]) < 100) continue;
      const src = tag.match(/src=["']([^"']+)["']/i)?.[1];
      if (src) {
        if (/\.(mp4|webm|mov)$/i.test(src)) {
          videos.push(src);
        } else {
          images.push(src);
        }
      }
    }

    // Extract from markdown images
    const mdImgMatches = content.matchAll(/!\[.*?\]\((.*?)\)/g);
    for (const match of mdImgMatches) {
      let url = match[1];
      if (!url.startsWith('http')) {
        url = `https://raw.githubusercontent.com/${owner}/${repo}/main/${url.replace(/^\.?\//, '')}`;
      }
      if (/\.(mp4|webm|mov)$/i.test(url)) {
        videos.push(url);
      } else {
        images.push(url);
      }
    }

    // Return video if found
    if (videos.length > 0) {
      return { previewImage: videos[0], isVideo: true, techStack };
    }

    // Return multiple images as JSON array if more than 1
    if (images.length > 1) {
      return { previewImage: JSON.stringify(images), isVideo: false, techStack };
    }

    // Return single image
    if (images.length === 1) {
      return { previewImage: images[0], isVideo: false, techStack };
    }

    return { previewImage: null, isVideo: false, techStack };
  } catch {
    return { previewImage: null, isVideo: false, techStack: [] };
  }
}

async function fetchAllLanguages(
  owner: string,
  repo: string,
  headers: HeadersInit
): Promise<string[]> {
  try {
    assertSafeSlug(owner, 'owner');
    assertSafeSlug(repo, 'repo');

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      { headers, next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Object.keys(data).map(l => l.toLowerCase());
  } catch {
    return [];
  }
}


export async function GET(request: NextRequest) {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'SobralCybersec-Portfolio',
    };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const allRepos = await Promise.all(
      GITHUB_USERNAMES.map(async (username) => {
        const response = await fetch(
          `https://api.github.com/users/${username}/repos?sort=${SORT_BY}&per_page=100&type=${REPO_TYPE}`,
          { headers, next: { revalidate: 3600 } }
        );
        if (!response.ok) return [];
        return response.json();
      })
    );

    const combined = allRepos.flat();
    const filtered = combined
      .filter((repo: any) => 
        !GITHUB_USERNAMES.some(u => repo.name.toLowerCase() === u.toLowerCase())
      )
      .sort((a: any, b: any) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

    // ponytail: enrich only the first 12 (displayed slice) to cap concurrent GitHub sub-calls.
    // Tail repos get cheap defaults; they're never rendered in the primary grid.
    const toEnrich = filtered.slice(0, 12);
    const remainder = filtered.slice(12);

    const enriched = [
      ...(await Promise.all(
        toEnrich.map(async (repo: any) => {
          const [readmeData, allLanguages] = await Promise.all([
            fetchReadmeData(repo.owner.login, repo.name, headers),
            fetchAllLanguages(repo.owner.login, repo.name, headers),
          ]);
          return {
            ...repo,
            previewImage: readmeData.previewImage ?? getLanguageImage(repo.language),
            isVideo: readmeData.isVideo,
            techStack: readmeData.techStack,
            allLanguages, // e.g. ["python", "batchfile", "assembly", "c", "yara"]
          };
        })
      )),
      ...remainder.map((repo: any) => ({
        ...repo,
        previewImage: getLanguageImage(repo.language),
        isVideo: false,
        techStack: [] as string[],
        allLanguages: [] as string[],
      })),
    ];

    return NextResponse.json(enriched, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
