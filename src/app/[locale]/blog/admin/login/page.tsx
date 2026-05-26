'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Lock } from 'lucide-react';
import { useTheme } from 'next-themes';

const HexagonGrid = dynamic(() => import('@/components/HexagonGrid'), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/ParticleBackground'), { ssr: false });

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/blog/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        const redirect = searchParams.get('redirect') || '/blog/admin';
        router.push(redirect);
      } else {
        setError('Invalid admin token');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full">
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-center mb-2">Admin Access</h1>
              <p className="text-gray-400 text-center mb-6">
                Enter your admin token to continue
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="token" className="block text-sm font-medium mb-2">
                    Admin Token
                  </label>
                  <input
                    id="token"
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="Enter admin token..."
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Verifying...' : 'Login'}
                </button>
              </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Admin access is only available in development mode
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  const { theme } = useTheme();

  return (
    <>
      <Navigation />
      <div className="page-grid-overlay" />
      {theme === 'dark' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: -2, pointerEvents: 'none' }}>
          <HexagonGrid 
            cellSize={60} 
            glowColor="rgba(168, 85, 247, 0.6)" 
            lineColor="rgba(168, 85, 247, 0.08)"
            glowInterval={150}
            maxSimultaneous={6}
          />
        </div>
      )}
      <div className="relative">
        <ParticleBackground />
        
        <div className="min-h-screen pt-32 pb-20 px-6 relative z-10 flex items-center justify-center">
          <Suspense fallback={
            <div className="max-w-md w-full">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-8 text-center">
                <div className="animate-pulse">Loading...</div>
              </div>
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </>
  );
}
