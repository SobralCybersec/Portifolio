'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Github, ExternalLink, Star, GitFork, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useHydrated } from '@/hooks/useHydrated';
import Image from 'next/image';

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  previewImage?: string;
  isVideo?: boolean;
  techStack?: string[];
}

interface RepoNode {
  x: number;
  y: number;
  size: number;
  repo: Repo;
  color: string;
}

// ── Language colors ───────────────────────────────────────────────────────────
const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5',
  Java: '#b07219', 'C++': '#f34b7d', C: '#555555', 'C#': '#178600',
  Go: '#00ADD8', Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95',
  Swift: '#F05138', Kotlin: '#A97BFF', Shell: '#89e051', HTML: '#e34c26',
  CSS: '#563d7c',
};
const DEFAULT_COLOR = '#a855f7';

// ── Tech icon mapping ─────────────────────────────────────────────────────────
const TECH_ICONS: Record<string, string> = {
  // Languages
  typescript: '/icons/typescript.png', javascript: '/icons/javascript.png', python: '/icons/python.png',
  java: '/icons/java.png', c: '/icons/c.png', 'c++': '/icons/cpp.png', cpp: '/icons/cpp.png',
  'c#': '/icons/csharp.png', csharp: '/icons/csharp.png', go: '/icons/github.png', rust: '/icons/rust.png',
  ruby: '/icons/ruby.png', php: '/icons/php.png', assembly: '/icons/assembly.png', bash: '/icons/bash.png',
  shell: '/icons/bash.png',
  // Frontend
  react: '/icons/react.png', nextjs: '/icons/nextjs.png', 'next.js': '/icons/nextjs.png',
  tailwind: '/icons/tailwind.png', tailwindcss: '/icons/tailwind.png',
  // Backend
  flask: '/icons/flask2.png', spring: '/icons/spring.png', 'spring-boot': '/icons/spring.png',
  // Database
  postgresql: '/icons/postgresql.png', postgres: '/icons/postgresql.png', redis: '/icons/redis.png',
  cassandra: '/icons/cassandra.png', kafka: '/icons/kafka.png',
  // DevOps
  docker: '/icons/docker.png', aws: '/icons/aws.png', github: '/icons/github.png',
  'github-actions': '/icons/actions.png', actions: '/icons/actions.png', maven: '/icons/maven.png',
  jetbrains: '/icons/jetbrains.png', vim: '/icons/vim.png',
  // Security
  burp: '/icons/burp.png', 'burp-suite': '/icons/burp.png', bloodhound: '/icons/bloodhound.png',
  ghidra: '/icons/ghidra.png', gobuster: '/icons/gobuster.png', hashcat: '/icons/hashcat.png',
  nessus: '/icons/nessus.png', shodan: '/icons/shodan.png', kali: '/icons/kalipurple.png',
  'kali-linux': '/icons/kalipurple.png', xdbg: '/icons/xdbg.png',
  // AI
  gpt: '/icons/gpt.png', openai: '/icons/gpt.png', claude: '/icons/claude.png', gemini: '/icons/gemini.png',
  // Architecture
  microservice: '/icons/microservice.png', microservices: '/icons/microservice.png',
  openapi: '/icons/openapi.png', swagger: '/icons/swagger.png',
};

function detectTechIcons(repo: Repo): string[] {
  const detected = new Set<string>();
  const check = (text: string | null | undefined) => {
    if (!text) return;
    const lower = text.toLowerCase();
    for (const [key, icon] of Object.entries(TECH_ICONS)) {
      if (lower.includes(key)) detected.add(icon);
    }
  };
  check(repo.language);
  check(repo.name);
  check(repo.description);
  repo.topics?.forEach(check);
  repo.techStack?.forEach(check);
  return Array.from(detected).slice(0, 4);
}

function langColor(lang: string | null | undefined): string {
  return lang ? (LANG_COLORS[lang] ?? DEFAULT_COLOR) : DEFAULT_COLOR;
}

function hexAlpha(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Image cache ───────────────────────────────────────────────────────────────
const imgCache = new Map<string, HTMLImageElement>();
function loadImg(src: string): HTMLImageElement | null {
  if (typeof window === 'undefined') return null;
  if (imgCache.has(src)) return imgCache.get(src)!;
  const img = window.document.createElement('img') as HTMLImageElement;
  img.crossOrigin = 'anonymous';
  img.src = src;
  img.onload = () => imgCache.set(src, img);
  imgCache.set(src, img);
  return null;
}

// ── TreePlugin TypeScript wrapper ────────────────────────────────────────────
declare global {
  interface Window {
    TreePlugin: any;
  }
}

export default function CityMap({ repos = [] }: { repos?: Repo[] }) {
  const { theme, systemTheme } = useTheme();
  const mounted = useHydrated();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const treeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const treeRef = useRef<any>(null);
  const animRef = useRef(0);

  // camera state
  const camRef = useRef({ x: 0, y: 0, z: 1 });
  const dragRef = useRef({ active: false, sx: 0, sy: 0, cx: 0, cy: 0 });
  const lastClickRef = useRef(0);

  // repo nodes
  const nodesRef = useRef<RepoNode[]>([]);

  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [hovered, setHovered] = useState<Repo | null>(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 });
  const [legends, setLegends] = useState<{ lang: string; color: string }[]>([]);

  const isDark = mounted ? (theme === 'system' ? systemTheme === 'dark' : theme === 'dark') : true;

  // ── place repos on tree branches ──────────────────────────────────────────
  const placeReposOnTree = useCallback((tree: any) => {
    if (!tree || !tree.branches) return;

    const nodes: RepoNode[] = [];
    const shuffled = [...repos].sort(() => Math.random() - 0.5);
    let repoIdx = 0;

    // collect all branch endpoints from depth 3 onwards
    const endpoints: { x: number; y: number }[] = [];
    for (let d = 3; d < tree.branches.length && d < 10; d++) {
      for (const branch of tree.branches[d]) {
        if (Math.random() > 0.6) { // sparse placement
          endpoints.push({ x: branch.endX, y: branch.endY });
        }
      }
    }

    // shuffle endpoints
    endpoints.sort(() => Math.random() - 0.5);

    // assign repos to endpoints
    for (const ep of endpoints) {
      if (repoIdx >= shuffled.length) break;
      const repo = shuffled[repoIdx++];
      const size = 8 + Math.min(repo.stargazers_count / 3, 30);
      nodes.push({
        x: ep.x,
        y: ep.y,
        size,
        repo,
        color: langColor(repo.language),
      });
    }

    nodesRef.current = nodes;

    // update legend
    const seen = new Map<string, string>();
    for (const node of nodes) {
      if (node.repo.language && !seen.has(node.repo.language))
        seen.set(node.repo.language, node.color);
    }
    setLegends(Array.from(seen.entries()).map(([lang, color]) => ({ lang, color })));
  }, [repos]);

  // ── sync tree canvas transform ───────────────────────────────────────────
  const syncTreeTransform = () => {
    if (!treeCanvasRef.current) return;
    const { x, y, z } = camRef.current;
    treeCanvasRef.current.style.transform = `translate(${x}px, ${y}px) scale(${z})`;
    treeCanvasRef.current.style.transformOrigin = '0 0';
  };

  // ── draw overlay (nodes + interactions) ───────────────────────────────────
  const drawOverlay = (ctx: CanvasRenderingContext2D, dpr: number) => {
    const canvas = ctx.canvas;
    const { x: cx, y: cy, z } = camRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(z, z);

    // draw repo nodes
    for (const node of nodesRef.current) {
      const screenSize = node.size * z;

      // LOD: skip tiny nodes
      if (screenSize < 3) continue;

      // glow
      ctx.shadowBlur = 15 / z;
      ctx.shadowColor = node.color;

      // outer circle
      ctx.fillStyle = hexAlpha(node.color, 0.8);
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      ctx.fill();

      // inner highlight
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size * 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;

      // LOD 1: name at zoom ≥ 1.8
      if (z >= 1.8 && screenSize > 30) {
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.min(12, node.size * 0.5) / z}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const label = node.repo.name.length > 14 ? node.repo.name.slice(0, 13) + '…' : node.repo.name;
        ctx.fillText(label, node.x, node.y + node.size + 4 / z);
        ctx.restore();
      }

      // LOD 2: tech icons at zoom ≥ 2.5
      if (z >= 2.5 && screenSize > 40) {
        const icons = detectTechIcons(node.repo);
        const iconSize = Math.min(node.size * 0.6, 16 / z);
        const spacing = iconSize + 2 / z;
        const totalWidth = icons.length * spacing - 2 / z;
        let startX = node.x - totalWidth / 2;
        const iconY = node.y - node.size - iconSize - 6 / z;

        for (const iconPath of icons) {
          const img = loadImg(iconPath);
          if (img && img.complete && img.naturalWidth > 0) {
            ctx.save();
            ctx.globalAlpha = 0.9;
            ctx.drawImage(img, startX, iconY, iconSize, iconSize);
            ctx.restore();
          }
          startX += spacing;
        }
      }

      // LOD 3: preview image at zoom ≥ 3.5
      if (z >= 3.5 && node.repo.previewImage && screenSize > 60) {
        let imgSrc = node.repo.previewImage;
        try {
          const parsed = JSON.parse(imgSrc);
          if (Array.isArray(parsed)) imgSrc = parsed[0];
        } catch {}
        const img = loadImg(imgSrc);
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.save();
          ctx.globalAlpha = 0.7;
          const imgSize = node.size * 2.5;
          ctx.drawImage(img, node.x - imgSize / 2, node.y - imgSize - node.size - 8 / z, imgSize, imgSize);
          ctx.restore();
        }
      }
    }

    ctx.restore();
  };

  // ── world/screen coords ───────────────────────────────────────────────────
  const toWorld = (sx: number, sy: number) => {
    const { x, y, z } = camRef.current;
    return { wx: (sx - x) / z, wy: (sy - y) / z };
  };

  const hitRepo = (wx: number, wy: number): Repo | null => {
    for (const node of nodesRef.current) {
      const dx = wx - node.x;
      const dy = wy - node.y;
      if (Math.sqrt(dx * dx + dy * dy) <= node.size) return node.repo;
    }
    return null;
  };

  // ── init tree ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined' || !mounted) return;

    const treeColors = isDark
      ? { color: '#ffffff' }
      : { color: '#000000' };

    // inject TreePlugin script if not loaded
    if (!window.TreePlugin) {
      const script = document.createElement('script');
      script.innerHTML = `!function(){function t(t){if(t=t||{},this.container=t.container||document.body,this.fullDepth=14,this.depth=t.depth||this.fullDepth,this.pixelRatio=window.devicePixelRatio>1?2:1,this.growthSpeed=t.growthSpeed||1,this.treeScale=t.treeScale||1,this.branchWidth=t.branchWidth||1,this.colorMode=t.colorMode||"solid",this.color=t.color||"#000",this.gradientStart=t.gradientStart||"#8B4513",this.gradientEnd=t.gradientEnd||"#228B22",this.seed=void 0!==t.seed?Number(t.seed):void 0,void 0!==this.seed){this.randSeq=[];for(var e=this.seed,i=0;i<1e4;i++){var s=((e=16807*e%2147483647)-1)/2147483646;this.randSeq.push(s)}this.randCounter=0}this.canvas=document.createElement("canvas"),this.container.appendChild(this.canvas),this.ctx=this.canvas.getContext("2d"),this.branches=[],this.animation=null,this.currentDepth=0,this.addEventListeners(),this.resize(),this.startTree(this.stageWidth/2,this.stageHeight)}t.prototype.addEventListeners=function(){window.addEventListener("resize",this.resize.bind(this))},t.prototype.resize=function(){this.stageWidth=this.container.clientWidth,this.stageHeight=this.container.clientHeight,this.canvas.width=this.stageWidth*this.pixelRatio,this.canvas.height=this.stageHeight*this.pixelRatio,this.ctx.setTransform(this.pixelRatio,0,0,this.pixelRatio,0,0),this.clearCanvas()},t.prototype.clearCanvas=function(){this.ctx.clearRect(0,0,this.stageWidth,this.stageHeight)},t.prototype.startTree=function(t,e){this.animation&&cancelAnimationFrame(this.animation),this.clearCanvas(),void 0!==this.seed&&(this.randCounter=0),this.branches=[];for(var i=0;i<=this.fullDepth;i++)this.branches.push([]);this.currentDepth=0,this.treeTop=1/0,this.treeX=t,this.treeY=e;var s=this.stageHeight/(10*this.fullDepth);this.treeScale>s&&(this.treeScale=s),this.createBranch(this.treeX,this.treeY,-90,0);for(var h=0;h<=this.fullDepth;h++)for(var r=0;r<this.branches[h].length;r++)this.branches[h][r].cntFrame=0;this.animate()},t.prototype.random=function(t,e){return this.randSeq?t+this.randSeq[this.randCounter++]*(e-t):Math.random()*(e-t)+t},t.prototype.degToRad=function(t){return t*(Math.PI/180)},t.prototype.createBranch=function(t,e,i,s){if(s<this.fullDepth){var h=this.treeScale,r=(0===s?this.random(12,16):this.random(0,13))*h,a=this.fullDepth-s,n=t+Math.cos(this.degToRad(i))*r*a,o=e+Math.sin(this.degToRad(i))*r*a;e<this.treeTop&&(this.treeTop=e),o<this.treeTop&&(this.treeTop=o);var d=this.branchWidth;this.branches[s].push({startX:t,startY:e,endX:n,endY:o,lineWidth:a*d,frame:100,cntFrame:0,gapX:(n-t)/100,gapY:(o-e)/100,plugin:this,draw:function(t,e){if(this.cntFrame<this.frame){t.beginPath();var i=this.cntFrame/this.frame,s=this.startX+(this.endX-this.startX)*i,h=this.startY+(this.endY-this.startY)*i;if(t.moveTo(this.startX,this.startY),t.lineTo(s,h),t.lineWidth=this.lineWidth,"gradient"===this.plugin.colorMode){var r=t.createLinearGradient(this.plugin.treeX,this.plugin.treeY,this.plugin.treeX,this.plugin.treeTop);r.addColorStop(0,this.plugin.gradientStart),r.addColorStop(1,this.plugin.gradientEnd),t.strokeStyle=r}else t.strokeStyle=this.plugin.color;return t.stroke(),t.closePath(),this.cntFrame+=e,!1}return!0}}),this.createBranch(n,o,i-this.random(18,28),s+1),this.createBranch(n,o,i+this.random(18,28),s+1)}},t.prototype.animate=function(){this.clearCanvas();for(var t=0;t<this.currentDepth&&t<this.depth&&t<this.branches.length;t++)for(var e=0;e<this.branches[t].length;e++){var i=this.branches[t][e];if(this.ctx.beginPath(),this.ctx.moveTo(i.startX,i.startY),this.ctx.lineTo(i.endX,i.endY),this.ctx.lineWidth=i.lineWidth,"gradient"===this.colorMode){var s=this.ctx.createLinearGradient(this.treeX,this.treeY,this.treeX,this.treeTop);s.addColorStop(0,this.gradientStart),s.addColorStop(1,this.gradientEnd),this.ctx.strokeStyle=s}else this.ctx.strokeStyle=this.color;this.ctx.stroke(),this.ctx.closePath()}var h=!1;if(this.currentDepth<this.depth&&this.currentDepth<this.branches.length){for(var r=!0,e=0;e<this.branches[this.currentDepth].length;e++){var i=this.branches[this.currentDepth][e];if(i.cntFrame<i.frame)i.draw(this.ctx,this.growthSpeed),h=!0,r=!1;else{if(this.ctx.beginPath(),this.ctx.moveTo(i.startX,i.startY),this.ctx.lineTo(i.endX,i.endY),this.ctx.lineWidth=i.lineWidth,"gradient"===this.colorMode){var s=this.ctx.createLinearGradient(this.treeX,this.treeY,this.treeX,this.treeTop);s.addColorStop(0,this.gradientStart),s.addColorStop(1,this.gradientEnd),this.ctx.strokeStyle=s}else this.ctx.strokeStyle=this.color;this.ctx.stroke(),this.ctx.closePath()}}r&&(this.currentDepth++,h=!0)}h?this.animation=requestAnimationFrame(this.animate.bind(this)):cancelAnimationFrame(this.animation)},t.prototype.updateColors=function(e){this.color=e.color||this.color,this.gradientStart=e.gradientStart||this.gradientStart,this.gradientEnd=e.gradientEnd||this.gradientEnd,this.colorMode=e.colorMode||this.colorMode},window.TreePlugin=t}();`;
      document.head.appendChild(script);
      
      setTimeout(() => {
        if (window.TreePlugin && containerRef.current) initTree();
      }, 100);
    } else {
      initTree();
    }

    function initTree() {
      if (!containerRef.current || !window.TreePlugin) return;
      
      // Destroy old tree if exists
      if (treeRef.current) {
        if (treeRef.current.animation) cancelAnimationFrame(treeRef.current.animation);
        if (treeRef.current.canvas && treeRef.current.canvas.parentNode) {
          treeRef.current.canvas.parentNode.removeChild(treeRef.current.canvas);
        }
      }
      
      const depth = Math.min(13, 9 + Math.floor(repos.length / 4));
      
      const tree = new window.TreePlugin({
        container: containerRef.current,
        depth,
        growthSpeed: 2.5,
        treeScale: 0.9,
        branchWidth: 1.5,
        colorMode: 'solid',
        ...treeColors,
        seed: 42,
      });

      treeRef.current = tree;
      treeCanvasRef.current = tree.canvas;

      setTimeout(() => {
        placeReposOnTree(tree);
      }, 3000);
    }

    return () => {
      if (treeRef.current?.animation) cancelAnimationFrame(treeRef.current.animation);
    };
  }, [repos, mounted, isDark, placeReposOnTree]);

  // ── overlay animation ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };
    resize();

    const tick = () => {
      syncTreeTransform();
      drawOverlay(ctx, dpr);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);

    // ── wheel zoom ──
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const cam = camRef.current;
      const nz = Math.min(6, Math.max(0.5, cam.z * factor));
      cam.x = mx - (mx - cam.x) * (nz / cam.z);
      cam.y = my - (my - cam.y) * (nz / cam.z);
      cam.z = nz;
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // ── drag pan ──
    const onDown = (e: MouseEvent) => {
      dragRef.current = { active: true, sx: e.clientX, sy: e.clientY, cx: camRef.current.x, cy: camRef.current.y };
    };
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const { wx, wy } = toWorld(sx, sy);
      const repo = hitRepo(wx, wy);
      setHovered(repo);
      setTooltip({ x: e.clientX, y: e.clientY });
      canvas.style.cursor = repo ? 'pointer' : dragRef.current.active ? 'grabbing' : 'grab';

      if (!dragRef.current.active) return;
      camRef.current.x = dragRef.current.cx + (e.clientX - dragRef.current.sx);
      camRef.current.y = dragRef.current.cy + (e.clientY - dragRef.current.sy);
    };
    const onUp = (e: MouseEvent) => {
      const moved = Math.abs(e.clientX - dragRef.current.sx) + Math.abs(e.clientY - dragRef.current.sy);
      dragRef.current.active = false;
      
      // Double click to reset zoom
      const now = Date.now();
      if (now - lastClickRef.current < 300 && moved < 5) {
        camRef.current = { x: 0, y: 0, z: 1 };
        lastClickRef.current = 0;
        return;
      }
      lastClickRef.current = now;
      
      if (moved < 5) {
        const rect = canvas.getBoundingClientRect();
        const { wx, wy } = toWorld(e.clientX - rect.left, e.clientY - rect.top);
        const repo = hitRepo(wx, wy);
        if (repo) setSelectedRepo(repo);
      }
    };
    const onLeave = () => { dragRef.current.active = false; setHovered(null); };

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // ── parse preview ─────────────────────────────────────────────────────────
  const getPreviewSrc = (repo: Repo): string | null => {
    if (!repo.previewImage) return null;
    try {
      const p = JSON.parse(repo.previewImage);
      if (Array.isArray(p)) return p[0];
    } catch {}
    return repo.previewImage;
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-black" style={{ height: 700 }}>
      <div ref={containerRef} className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at bottom, #0a0a0a 0%, #000000 100%)' }} />
      <canvas ref={overlayRef} className="absolute inset-0 w-full h-full pointer-events-auto" style={{ cursor: 'grab' }} />

      {/* legend */}
      {legends.length > 0 && (
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 max-w-[320px] pointer-events-none">
          {legends.map(({ lang, color }) => (
            <span key={lang} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-black/80 border border-white/15 backdrop-blur-sm" style={{ color }}>
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
              {lang}
            </span>
          ))}
        </div>
      )}

      {/* hint */}
      <div className="absolute top-4 right-4 text-xs text-white/25 font-mono pointer-events-none select-none">
        scroll zoom · drag pan · double-click reset · click project
      </div>

      {/* hover tooltip */}
      {hovered && !selectedRepo && (
        <div
          className="fixed z-50 pointer-events-none bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-3 max-w-[240px]"
          style={{ left: tooltip.x + 18, top: tooltip.y + 18 }}
        >
          <p className="font-bold text-sm mb-1" style={{ color: langColor(hovered.language) }}>{hovered.name}</p>
          {hovered.language && (
            <p className="text-xs text-white/50">{hovered.language} · ⭐ {hovered.stargazers_count}</p>
          )}
        </div>
      )}

      {/* project card modal */}
      {selectedRepo && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setSelectedRepo(null)}>
          <div
            className="relative w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            {/* Solo Leveling Style Card */}
            <div
              className="relative overflow-hidden rounded-[2px]"
              style={{
                border: `1px solid ${isDark ? '#6366f1' : '#3b82f6'}59`,
                background: isDark ? 'rgba(1,6,20,0.96)' : 'rgba(255,255,255,0.96)',
                boxShadow: `0 0 0 1px ${isDark ? '#6366f1' : '#3b82f6'}33, 0 0 40px ${isDark ? '#6366f1' : '#3b82f6'}1f, inset 0 0 80px ${isDark ? 'rgba(0,30,100,0.35)' : 'rgba(0,60,180,0.15)'}`,
              }}
            >
              {/* Scanline effect */}
              <div
                className="pointer-events-none absolute left-0 right-0 h-px animate-scanline"
                style={{ background: `linear-gradient(90deg,transparent,${isDark ? '#6366f1' : '#3b82f6'}b3,transparent)` }}
              />

              {/* Edge glows */}
              {(['top','bottom'] as const).map((side) => (
                <div key={side} className={`absolute ${side === 'top' ? '-top-px' : '-bottom-px'} left-[10%] right-[10%] h-px animate-edgepulse`}
                  style={{ background: `linear-gradient(90deg,transparent,${isDark ? '#3b82f6' : '#1d4ed8'},${isDark ? '#6366f1' : '#3b82f6'},${isDark ? '#3b82f6' : '#1d4ed8'},transparent)` }} />
              ))}
              {(['left','right'] as const).map((side) => (
                <div key={side} className={`absolute ${side === 'left' ? '-left-px' : '-right-px'} top-[10%] bottom-[10%] w-px animate-edgepulse`}
                  style={{ background: `linear-gradient(180deg,transparent,${isDark ? '#3b82f6' : '#1d4ed8'},${isDark ? '#6366f1' : '#3b82f6'},${isDark ? '#3b82f6' : '#1d4ed8'},transparent)` }} />
              ))}

              {/* Corners */}
              {[
                { pos: '-top-[3px] -left-[3px]',   bw: '2px 0 0 2px',   dot: '-top-px -left-px'   },
                { pos: '-top-[3px] -right-[3px]',  bw: '2px 2px 0 0',   dot: '-top-px -right-px'  },
                { pos: '-bottom-[3px] -left-[3px]', bw: '0 0 2px 2px',  dot: '-bottom-px -left-px' },
                { pos: '-bottom-[3px] -right-[3px]',bw: '0 2px 2px 0',  dot: '-bottom-px -right-px'},
              ].map((c, i) => (
                <div key={i} className={`absolute ${c.pos} h-5 w-5`} style={{ borderStyle: 'solid', borderWidth: c.bw, borderColor: isDark ? '#3b82f6' : '#1d4ed8' }}>
                  <div className={`absolute ${c.dot} h-1.5 w-1.5`} style={{ background: isDark ? '#3b82f6' : '#1d4ed8', boxShadow: `0 0 10px 3px ${isDark ? '#3b82f6' : '#1d4ed8'}e6` }} />
                </div>
              ))}

              {/* Header */}
              <div className="relative flex items-center border-b" style={{ borderColor: `${isDark ? '#6366f1' : '#3b82f6'}4d` }}>
                <div className="absolute -bottom-px left-0 right-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${isDark ? '#3b82f6' : '#1d4ed8'}e6,transparent)` }} />
                <div className="flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center border-r" style={{ borderColor: `${isDark ? '#6366f1' : '#3b82f6'}4d`, background: isDark ? 'rgba(0,40,100,0.3)' : 'rgba(59,130,246,0.1)' }}>
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2"
                    style={{ borderColor: isDark ? '#3b82f6' : '#1d4ed8', boxShadow: `0 0 12px ${isDark ? '#3b82f6' : '#1d4ed8'}b3, inset 0 0 10px ${isDark ? '#3b82f6' : '#1d4ed8'}26` }}
                  >
                    <Github className="w-5 h-5" style={{ color: isDark ? '#3b82f6' : '#1d4ed8' }} />
                  </div>
                </div>
                <div className="relative mx-[14px] my-2.5 flex flex-1 items-center border px-4 py-2" style={{ borderColor: `${isDark ? '#6366f1' : '#3b82f6'}40`, background: isDark ? 'rgba(0,30,80,0.2)' : 'rgba(59,130,246,0.05)' }}>
                  <div className="absolute -bottom-px -left-px -top-px w-[3px]" style={{ background: isDark ? '#3b82f6' : '#1d4ed8', boxShadow: `0 0 8px ${isDark ? '#3b82f6' : '#1d4ed8'}cc` }} />
                  <div className="absolute -bottom-px -right-px -top-px w-[3px]" style={{ background: isDark ? '#3b82f6' : '#1d4ed8', boxShadow: `0 0 8px ${isDark ? '#3b82f6' : '#1d4ed8'}cc` }} />
                  <button
                    onClick={() => setSelectedRepo(null)}
                    className="absolute -top-2 -right-2 p-1 rounded-full"
                    style={{ background: isDark ? '#3b82f6' : '#1d4ed8', boxShadow: `0 0 10px ${isDark ? '#3b82f6' : '#1d4ed8'}` }}
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <span className="font-black uppercase leading-none tracking-[4px] truncate" style={{ fontFamily: 'Orbitron,monospace', fontSize: 13, color: '#e0f4ff', textShadow: `0 0 8px ${isDark ? '#3b82f6' : '#1d4ed8'}e6, 0 0 20px ${isDark ? '#6366f1' : '#3b82f6'}99` }}>
                    {selectedRepo.name}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 pb-5 pt-5">
                {getPreviewSrc(selectedRepo) && (
                  <div className="w-full rounded-lg overflow-hidden mb-4 border" style={{ aspectRatio: '16/9', borderColor: `${isDark ? '#6366f1' : '#3b82f6'}66`, background: isDark ? 'rgba(0,10,30,0.8)' : 'rgba(59,130,246,0.05)' }}>
                    {selectedRepo.isVideo ? (
                      <video src={getPreviewSrc(selectedRepo)!} className="w-full h-full object-contain" autoPlay loop muted playsInline />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <Image
                        src={getPreviewSrc(selectedRepo)!}
                        alt={selectedRepo.name}
                        className="w-full h-full object-contain"
                        onError={e => { (e.target as HTMLImageElement).src = `https://opengraph.githubassets.com/1/${selectedRepo.html_url.replace('https://github.com/', '')}`; }}
                      />
                    )}
                  </div>
                )}

                <p className="text-sm mb-4 leading-relaxed" style={{ fontFamily: 'Rajdhani,sans-serif', color: isDark ? 'rgba(180,220,255,0.8)' : 'rgba(30,64,175,0.8)' }}>
                  {selectedRepo.description || 'No description'}
                </p>

                <div className="flex items-center gap-4 text-xs mb-4" style={{ color: isDark ? 'rgba(160,210,255,0.8)' : 'rgba(59,130,246,0.8)' }}>
                  {selectedRepo.language && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: langColor(selectedRepo.language) }} />
                      {selectedRepo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />{selectedRepo.stargazers_count}</span>
                  <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" />{selectedRepo.forks_count}</span>
                </div>

                {selectedRepo.techStack && selectedRepo.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedRepo.techStack.map(t => (
                      <span key={t} className="px-2.5 py-1 text-xs rounded border" style={{ background: isDark ? 'rgba(0,10,30,0.8)' : 'rgba(59,130,246,0.05)', borderColor: `${isDark ? '#6366f1' : '#3b82f6'}66`, color: isDark ? 'rgba(160,210,255,0.8)' : 'rgba(59,130,246,0.9)' }}>{t}</span>
                    ))}
                  </div>
                )}

                {selectedRepo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {selectedRepo.topics.slice(0, 5).map(t => (
                      <span key={t} className="px-2.5 py-1 text-xs rounded-full" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.4)' }}>{t}</span>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <a href={selectedRepo.html_url} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded border transition-all"
                    style={{ 
                      background: isDark ? 'rgba(0,10,30,0.8)' : 'rgba(59,130,246,0.05)', 
                      borderColor: `${isDark ? '#6366f1' : '#3b82f6'}66`,
                      color: isDark ? '#e0f4ff' : '#1d4ed8',
                      fontFamily: 'Rajdhani,sans-serif',
                      fontWeight: 600
                    }}>
                    <Github className="w-4 h-4" /> Code
                  </a>
                  {selectedRepo.homepage && (
                    <a href={selectedRepo.homepage} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded border transition-all"
                      style={{ 
                        background: 'rgba(168,85,247,0.15)', 
                        borderColor: 'rgba(168,85,247,0.4)',
                        color: '#a855f7',
                        fontFamily: 'Rajdhani,sans-serif',
                        fontWeight: 600
                      }}>
                      <ExternalLink className="w-4 h-4" /> Demo
                    </a>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t px-[18px] py-2" style={{ borderColor: `${isDark ? '#6366f1' : '#3b82f6'}33`, background: isDark ? 'rgba(0,10,30,0.4)' : 'rgba(59,130,246,0.03)' }}>
                <span className="leading-none tracking-[2px] text-xs" style={{ fontFamily: 'Orbitron,monospace', color: `${isDark ? '#6366f1' : '#3b82f6'}66` }}>
                  PROJECT DETAILS
                </span>
                <div className="flex items-center gap-1.5">
                  {[0, 0.3, 0.6].map((delay, i) => (
                    <div key={i} className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: isDark ? '#3b82f6' : '#1d4ed8', boxShadow: `0 0 6px ${isDark ? '#3b82f6' : '#1d4ed8'}cc`, animationDelay: `${delay}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes edgepulse { 0%,100%{opacity:0.55} 50%{opacity:1} }
            @keyframes scanline { 0%{top:-2px} 100%{top:100%} }
            .animate-scanline { animation: scanline 4s linear infinite; }
            .animate-edgepulse { animation: edgepulse 2.5s ease-in-out infinite; }
          `}</style>
        </div>
      )}
    </div>
  );
}
