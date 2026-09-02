import type { ReactNode } from 'react';

export default function RouteView({ children }: { children: ReactNode }) {
  return <div className="portfolio-route-view">{children}</div>;
}
