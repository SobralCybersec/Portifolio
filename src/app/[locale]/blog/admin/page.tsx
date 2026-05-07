import Navigation from '@/components/Navigation';
import HexagonGrid from '@/components/HexagonGrid';
import ParticleBackground from '@/components/ParticleBackground';
import BlogAdminClient from './BlogAdminClient';

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
