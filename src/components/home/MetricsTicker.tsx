'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { InfiniteMarquee } from '@/components/ui/InfiniteMarquee';

export default function MetricsTicker() {
  const t = useTranslations('hero');
  const [text, setText] = useState(t('ticker'));

  useEffect(() => {
    async function fetchRepoCount() {
      try {
        const res = await fetch('/api/github/stats');
        const data = await res.json();
        const baseText = t('ticker');
        setText(baseText.replace('OPEN SOURCE', `${data.publicRepos}+ OPEN SOURCE PROJECTS`));
      } catch {}
    }
    fetchRepoCount();
  }, [t]);

  return (
    <div className="metrics-ticker-wrapper">
      <InfiniteMarquee
        items={[<span key={text} className="scroll-text">{text}</span>]}
        speed={28}
        className="metrics-ticker"
      />
    </div>
  );
}
