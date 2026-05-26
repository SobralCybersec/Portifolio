import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import BlogAdminClient from './BlogAdminClient';

const HexagonGrid = dynamic(() => import('@/components/HexagonGrid'), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/ParticleBackground'), { ssr: false });

export default function BlogAdminPage() {
  return (
    <>
      <Navigation />
      <div className="page-grid-overlay" />
      <div style={{ position: 'fixed', inset: 0, zIndex: -2, pointerEvents: 'none' }}>
        <HexagonGrid 
          cellSize={60} 
          glowColor="rgba(168, 85, 247, 0.6)" 
          lineColor="rgba(168, 85, 247, 0.08)"
          glowInterval={150}
          maxSimultaneous={6}
        />
      </div>
      <div className="relative">
        <ParticleBackground />
        <BlogAdminClient />
      </div>
    </>
  );
}
