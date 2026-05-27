'use client';

import { useEffect, useRef } from 'react';
import { useHydrated } from '@/hooks/useHydrated';

interface HexagonGridProps {
  cellSize?: number;
  glowColor?: string;
  lineColor?: string;
  glowInterval?: number;
  maxSimultaneous?: number;
}

/** CWE-79: only allow CSS color values that match safe patterns before
 *  injecting them into SVG attributes or inline styles. */
const SAFE_COLOR_RE = /^(rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(\s*,\s*[\d.]+)?\s*\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]{2,30}|transparent)$/;

function sanitizeColor(value: string, fallback: string): string {
  return SAFE_COLOR_RE.test(value.trim()) ? value.trim() : fallback;
}

const HexagonGrid = ({
  cellSize = 60,
  glowColor = 'rgba(168, 85, 247, 0.6)',
  lineColor = 'rgba(168, 85, 247, 0.08)',
  glowInterval = 150,
  maxSimultaneous = 6
}: HexagonGridProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const cellsRef = useRef<SVGPolygonElement[]>([]);
  const activeCountRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mounted = useHydrated();

  // Sanitize color props once — never inject raw prop values into SVG attributes
  const safeLineColor = sanitizeColor(lineColor, 'rgba(168, 85, 247, 0.08)');
  const safeGlowColor = sanitizeColor(glowColor, 'rgba(168, 85, 247, 0.6)');

  useEffect(() => {
    if (!mounted) return;
    
    const svg = svgRef.current;
    if (!svg) return;

    const buildGrid = () => {
      // Clamp to safe positive integers before use in SVG attributes (CWE-79)
      const w = Math.max(1, Math.trunc(window.innerWidth));
      const h = Math.max(1, Math.trunc(window.innerHeight));

      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      cellsRef.current = [];

      const hexWidth = cellSize * Math.sqrt(3);
      const hexHeight = cellSize * 2;
      const vertDist = hexHeight * 0.75;

      const cols = Math.ceil(w / hexWidth) + 2;
      const rows = Math.ceil(h / vertDist) + 2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * hexWidth + (row % 2 === 1 ? hexWidth / 2 : 0);
          const y = row * vertDist;

          const points = getHexagonPoints(x, y, cellSize);
          const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          polygon.setAttribute('points', points);
          polygon.setAttribute('fill', 'transparent');
          polygon.setAttribute('stroke', safeLineColor);
          polygon.setAttribute('stroke-width', '1');
          polygon.style.transition = 'all 0.3s ease';

          svg.appendChild(polygon);
          cellsRef.current.push(polygon);
        }
      }
    };

    const getHexagonPoints = (cx: number, cy: number, size: number): string => {
      const points: [number, number][] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = cx + size * Math.cos(angle);
        const y = cy + size * Math.sin(angle);
        points.push([x, y]);
      }
      return points.map(p => p.join(',')).join(' ');
    };

    const highlightRandom = () => {
      // Disabled - only showing static lines
      return;
    };

    buildGrid();
    // Removed interval for glowing effect

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        activeCountRef.current = 0;
        buildGrid();
      }, 200);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [mounted, cellSize, safeGlowColor, safeLineColor, glowInterval, maxSimultaneous]);

  if (!mounted) {
    return null;
  }

  return (
    <svg
      ref={svgRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
    />
  );
};

export default HexagonGrid;
