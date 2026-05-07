'use client';

import { useEffect, useRef, useState } from 'react';

interface NeuralTreeProps {
  repos: any[];
}

export default function NeuralTree({ repos }: NeuralTreeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredRepo, setHoveredRepo] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const nodesRef = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawTree();
    };

    const drawTree = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodesRef.current = [];

      const startX = canvas.width / 2;
      const startY = canvas.height - 50;
      const initialLength = Math.min(canvas.height * 0.25, 150);
      const initialWidth = 15;

      drawBranch(startX, startY, initialLength, -90, initialWidth, 0, repos);
    };

    const drawBranch = (
      x: number,
      y: number,
      length: number,
      angle: number,
      width: number,
      depth: number,
      remainingRepos: any[]
    ) => {
      if (length < 10 || depth > 8) return;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((angle * Math.PI) / 180);

      // Draw branch
      const gradient = ctx.createLinearGradient(0, 0, 0, -length);
      gradient.addColorStop(0, depth === 0 ? '#8B4513' : '#654321');
      gradient.addColorStop(1, '#2d1810');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(168, 85, 247, 0.3)';
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -length);
      ctx.stroke();

      const endX = x + Math.sin((angle * Math.PI) / 180) * length;
      const endY = y + Math.cos((angle * Math.PI) / 180) * length;

      // Add node if we have repos
      if (remainingRepos.length > 0 && depth > 2 && Math.random() > 0.3) {
        const repo = remainingRepos[0];
        const nodeSize = 8 + (repo.stargazers_count || 0) / 5;
        
        nodesRef.current.push({
          x: endX,
          y: endY,
          size: nodeSize,
          repo: repo
        });

        // Draw node
        const nodeGradient = ctx.createRadialGradient(0, -length, 0, 0, -length, nodeSize);
        nodeGradient.addColorStop(0, getLanguageColor(repo.language));
        nodeGradient.addColorStop(0.5, getLanguageColor(repo.language));
        nodeGradient.addColorStop(1, 'rgba(168, 85, 247, 0.2)');
        
        ctx.fillStyle = nodeGradient;
        ctx.shadowBlur = 15;
        ctx.shadowColor = getLanguageColor(repo.language);
        ctx.beginPath();
        ctx.arc(0, -length, nodeSize, 0, Math.PI * 2);
        ctx.fill();

        // Inner glow
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -length, nodeSize * 0.3, 0, Math.PI * 2);
        ctx.fill();

        remainingRepos = remainingRepos.slice(1);
      }

      ctx.restore();

      // Create branches
      const branchCount = depth < 3 ? 2 : Math.random() > 0.5 ? 2 : 3;
      const angleVariation = 25 + Math.random() * 15;
      
      for (let i = 0; i < branchCount; i++) {
        const branchAngle = angle + (i === 0 ? -angleVariation : i === 1 ? angleVariation : 0);
        const branchLength = length * (0.65 + Math.random() * 0.15);
        const branchWidth = width * 0.7;
        
        const reposForBranch = remainingRepos.slice(0, Math.ceil(remainingRepos.length / branchCount));
        drawBranch(endX, endY, branchLength, branchAngle, branchWidth, depth + 1, reposForBranch);
        remainingRepos = remainingRepos.slice(reposForBranch.length);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setMousePos({ x: e.clientX, y: e.clientY });

      let found = false;
      for (const node of nodesRef.current) {
        const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
        if (distance < node.size + 5) {
          setHoveredRepo(node.repo);
          canvas.style.cursor = 'pointer';
          found = true;
          break;
        }
      }
      
      if (!found) {
        setHoveredRepo(null);
        canvas.style.cursor = 'default';
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (const node of nodesRef.current) {
        const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
        if (distance < node.size + 5) {
          window.open(node.repo.html_url, '_blank');
          break;
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [repos]);

  return (
    <div className="relative w-full h-[700px] rounded-lg overflow-hidden bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-sm border border-[var(--theme-primary)]/20">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: 'radial-gradient(ellipse at bottom, #1a0a2e 0%, #000000 100%)' }}
      />
      
      {hoveredRepo && (
        <div
          className="fixed z-50 pointer-events-none bg-black/90 backdrop-blur-md border border-[var(--theme-primary)] rounded-lg p-4 max-w-xs"
          style={{
            left: mousePos.x + 20,
            top: mousePos.y + 20,
          }}
        >
          <h3 className="text-lg font-bold text-[var(--theme-primary)] mb-2">
            {hoveredRepo.name}
          </h3>
          <p className="text-sm text-[var(--text-muted)] mb-2">
            {hoveredRepo.description || 'No description'}
          </p>
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
            {hoveredRepo.language && (
              <span className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getLanguageColor(hoveredRepo.language) }}
                />
                {hoveredRepo.language}
              </span>
            )}
            <span>⭐ {hoveredRepo.stargazers_count}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function getLanguageColor(language: string | null): string {
  if (!language) return '#a855f7';
  
  const colors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4F5D95',
  };
  return colors[language] || '#a855f7';
}
