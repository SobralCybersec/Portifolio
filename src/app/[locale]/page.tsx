'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useClickSound } from '@/hooks/useClickSound';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import SoloLevelingBoot from '@/components/SoloLevelingBoot';

export default function Page() {
  const [bootComplete, setBootComplete] = useState(true);

  const tHero = useTranslations('hero');
  const tAbout = useTranslations('about');
  const tNav = useTranslations('nav');

  useClickSound();

  useEffect(() => {
    try {
      if (window.localStorage.getItem('bootComplete') === 'true') {
        setBootComplete(true);
      }
    } catch {
      // ignore storage access issues
    }
  }, []);

  const handleBootComplete = () => {
    setBootComplete(true);

    try {
      window.localStorage.setItem('bootComplete', 'true');
    } catch {
      // ignore storage access issues
    }

    window.dispatchEvent(new Event('bootComplete'));
  };

  useEffect(() => {
    if (!bootComplete) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (!elements.length) return;

    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((el) => obs.observe(el));

    return () => obs.disconnect();
  }, [bootComplete]);

  if (!bootComplete) {
    return <SoloLevelingBoot onComplete={handleBootComplete} />;
  }

  return (
    <>
      <div className="bg-noise" />
      <Navigation />

      {/* HERO */}
      <div className="hero">
        <div className="speed-lines" />
        <div className="hero-scan" />

        <div className="hero-text">
          <p className="hero-eyebrow">// CCG — Investigator File #001</p>
          <h1 className="hero-name">
            MATHEUS<br />S. SILVA
            <span className="glitch-layer" aria-hidden="true">
              MATHEUS<br />S. SILVA
            </span>
          </h1>
          <p className="hero-role">
            Full-Stack Dev <em>&amp;</em> Cybersecurity
          </p>
          <div className="speech-bubble">
            &ldquo;I&apos;ve had enough with dreaming.<br />I build. I break. I secure.&rdquo;
          </div>
          <div className="hero-cta">
            <Link href="/projects" className="btn btn-primary">
              {tHero('cta.viewProjects')}
            </Link>
            <a href="/cv/cv.pdf" className="btn btn-outline" download>
              ↓ {tHero('cta.downloadCV')}
            </a>
          </div>
        </div>

        <div className="hero-image">
          <div className="img-wrap">
            <img
              className="img-a"
              src="/images/kaneki-main.jpg"
              alt="Black Reaper — Kaneki Ken"
            />
            <img
              className="img-b"
              src="/images/kaneki-manga.jpg"
              alt="Black Reaper"
            />
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* STATS */}
      <div className="stats-bar">
        <div className="stat-item reveal">
          <div className="stat-num">3<em>+</em></div>
          <div className="stat-label">{tHero('stats.experience')}</div>
        </div>
        <div className="stat-item reveal">
          <div className="stat-num">20<em>+</em></div>
          <div className="stat-label">{tHero('stats.projects')}</div>
        </div>
        <div className="stat-item reveal">
          <div className="stat-num">10<em>+</em></div>
          <div className="stat-label">Certs</div>
        </div>
        <div className="stat-item reveal">
          <div className="stat-num">∞</div>
          <div className="stat-label">Lines of Code</div>
        </div>
      </div>

      <div className="divider-accent" />

      {/* ABOUT */}
      <section className="section" id="about">
        <div className="about-grid">
          <div className="about-img-wrap reveal">
            <img src="/images/kaneki-manga.jpg" alt="Kaneki — manga panel" />
            <div className="img-label">BLACK REAPER</div>
          </div>

          <div className="about-content">
            <p className="section-label">// Investigator Profile</p>
            <h2 className="section-title">{tAbout('title')}</h2>
            <p>
              <strong>Matheus S. Silva</strong> — {tAbout('backgroundText1')}
            </p>
            <p>{tAbout('backgroundText2')}</p>

            <div className="skills-grid">
              {['Python', 'JavaScript', 'Node.js', 'React', 'Linux', 'Pentesting', 'Docker', 'SQL / NoSQL'].map(
                (s) => (
                  <span className="skill-tag" key={s}>
                    {s}
                  </span>
                )
              )}
            </div>

            <a href="/cv/cv.pdf" className="btn btn-primary" download>
              ↓ {tHero('cta.downloadCV')}
            </a>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* CYBERSECURITY */}
      <section className="cyber-section" id="cybersecurity">
        <div className="cyber-inner">
          <p className="section-label">// CCG Special Operations — Threat Intelligence</p>
          <h2 className="section-title">{tAbout('cybersecurity')}</h2>

          <div className="ccg-header reveal">
            <div className="ccg-stamp">CCG</div>
            <div className="ccg-meta">
              <strong>INVESTIGATOR FILE — CLASSIFIED</strong>
              <br />
              Subject: Matheus S. Silva &nbsp;|&nbsp; Rank: Special Class
              <br />
              Specialization: Offensive Security / Full-Stack Engineering
              <br />
              Status: <span style={{ color: 'var(--accent-mid)' }}>■ ACTIVE THREAT ANALYST</span>
            </div>
          </div>

          <div className="cyber-grid">
            {[
              {
                num: '01',
                title: 'Penetration Testing',
                desc: 'Web app, network, and API pentesting. OWASP Top 10, CVE exploitation, privilege escalation.',
                tag: 'Offensive',
              },
              {
                num: '02',
                title: 'Threat Analysis',
                desc: 'Forensic investigation of attack vectors. Log analysis, malware behavior mapping, incident response.',
                tag: 'Forensics',
              },
              {
                num: '03',
                title: 'Secure Development',
                desc: 'Security baked in — not bolted on. Auth flows, input validation, dependency auditing, SAST/DAST pipelines.',
                tag: 'DevSecOps',
              },
              {
                num: '04',
                title: 'OSINT & Recon',
                desc: 'Open-source intelligence gathering. Passive and active reconnaissance. Mapping attack surfaces.',
                tag: 'Intelligence',
              },
            ].map(({ num, title, desc, tag }) => (
              <div className="cyber-card reveal" key={num}>
                <div className="cyber-card-icon">{num}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <span className="card-tag">{tag}</span>
              </div>
            ))}
          </div>

          <div className="cyber-terminal reveal">
            <div className="terminal-bar">
              <span>CCG — TERMINAL v2.1</span>
              <span>SECURE CHANNEL</span>
            </div>
            <div className="terminal-body">
              <div>
                <span className="t-prompt">root@ccg:~$</span> nmap -sV --script vuln target.host
              </div>
              <div className="t-out">Starting Nmap 7.94 — stealth scan initiated...</div>
              <div className="t-ok">443/tcp  open   https     nginx 1.24.0</div>
              <div className="t-warn">8080/tcp open   http-alt  [VULNERABLE: CVE-2023-XXXX]</div>
              <div className="t-out">Scan complete. 2 vulnerabilities flagged.</div>
              <div>
                <span className="t-prompt">root@ccg:~$</span> exploit --target 8080 --payload reverse_shell
              </div>
              <div className="t-ok">[+] Shell obtained. Access granted.</div>
              <div>
                <span className="t-prompt">root@ccg:~$</span> <span className="terminal-cursor" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      <footer className="ccg-footer">
        <span>© 2026 Matheus S. Silva</span>
        <span>
          <a href="https://github.com/SobralCybersec" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          &nbsp;·&nbsp;
          <Link href="/contact">{tNav('contact')}</Link>
        </span>
      </footer>
    </>
  );
}