'use client';

import { useEffect, useRef, useState } from 'react';
import { useHydrated } from '@/hooks/useHydrated';

interface HexagonGridProps {
  cellSize?: number;
  glowColor?: string;
  lineColor?: string;
  glowInterval?: number;
  maxSimultaneous?: number;
}

const HexagonGrid = ({
  cellSize = 60,
  glowColor = 'rgba(168, 85, 247, 0.6)',
  lineColor = 'rgba(168, 85, 247, 0.08)',
  glowInterval = 150,
  maxSimultaneous = 6
}: HexagonGridProps) => {
  const svgRef = useRef<SVGSVGonElement | null>(null);
  const cellsRef = useRef<SVGPolygonElement[]>([]);
  const activeCountRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mounted = useHydrated();

  useEffect(() => {
    if (!mounted) return;
    
    const svg = svgRef.current;
    if (!svg) return;

    const buildGrid = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.innerHTML = '';
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
          polygon.setAttribute('stroke', lineColor);
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
      window.removeEventListener('resize', handleResize);
    };
  }, [mounted, cellSize, glowColor, lineColor, glowInterval, maxSimultaneous]);

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
