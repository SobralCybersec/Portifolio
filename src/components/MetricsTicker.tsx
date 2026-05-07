'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

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
      <div className="metrics-ticker">
        <span className="scroll-text">{text}</span>
      </div>
    </div>
  );
}
