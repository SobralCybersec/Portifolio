'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useClickSound } from '@/hooks/useClickSound';
import { useTranslations } from 'next-intl';

export default function ContactPage() {
  useClickSound();
  const t = useTranslations('contact');

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = '// Name required.';
    if (!email.trim() || !email.includes('@')) errs.email = '// Valid email required.';
    if (!message.trim()) errs.message = '// Message required.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const sub = subject || 'Portfolio Contact';
    const body = `Name: ${name}\n\n${message}`;
    window.location.href = `mailto:matheussobrallinkedin@gmail.com?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <>
      <div className="bg-noise" />
      <Navigation />

      <div className="page-header">
        <div className="speed-lines" />
        <div className="page-header-inner">
          <p className="page-eyebrow">// Transmission Channel</p>
          <h1 className="page-title">
            CONTACT
            <span className="glitch-layer" aria-hidden="true">CONTACT</span>
          </h1>
        </div>
      </div>

      <div className="contact-wrap">
        {/* LEFT — info panel */}
        <div className="contact-info-panel reveal">
          <p className="section-label">// Direct Channels</p>
          <h2 className="contact-heading">{t('getInTouch')}</h2>
          <p className="contact-desc">{t('description')}</p>

          <div className="social-links">
            <a href="https://github.com/SobralCybersec" target="_blank" rel="noopener" className="social-link">
              <span className="icon">⌥</span> GitHub — SobralCybersec
            </a>
            <a href="mailto:matheussobrallinkedin@gmail.com" className="social-link">
              <span className="icon">@</span> matheussobrallinkedin@gmail.com
            </a>
            <a href="https://www.linkedin.com/in/matheus-sobral-b17a5b1b9/" target="_blank" rel="noopener" className="social-link">
              <span className="icon">in</span> LinkedIn
            </a>
          </div>
        </div>

        {/* RIGHT — form panel */}
        <div className="contact-form-panel reveal">
          <p className="section-label">// Transmit Message</p>
          <h2 className="contact-heading">{t('title')}</h2>

          {sent ? (
            <div className="form-success">
              ✓ Transmission received. I&apos;ll respond shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Your Name</label>
                <input className="form-input" id="name" type="text" placeholder="Ken Kaneki"
                  value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input className="form-input" id="email" type="email" placeholder="you@domain.com"
                  value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="subject">Subject</label>
                <input className="form-input" id="subject" type="text" placeholder="Project / Collaboration / Other"
                  value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="message">Message</label>
                <textarea className="form-textarea" id="message" placeholder="Transmit your message..."
                  value={message} onChange={e => setMessage(e.target.value)} />
                {errors.message && <span className="form-error">{errors.message}</span>}
              </div>
              <button type="submit" className="btn btn-primary">→ Send Transmission</button>
            </form>
          )}
        </div>
      </div>

      <div className="divider" />

      <footer className="ccg-footer">
        <span>{t('footer')}</span>
        <span>
          <a href="https://github.com/SobralCybersec" target="_blank" rel="noopener">GitHub</a>
        </span>
      </footer>

      <style>{`
        .contact-wrap {
          position: relative; z-index: 1;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 2px; background: var(--fg);
          max-width: 1200px; margin: 2rem auto;
        }
        @media (max-width: 768px) { .contact-wrap { grid-template-columns: 1fr; } }
        .contact-info-panel, .contact-form-panel {
          background: var(--bg);
          border: 3px solid var(--fg);
          outline: 5px solid var(--bg); outline-offset: -8px;
          padding: 2.5rem;
        }
        .contact-heading {
          font-family: var(--font-display); font-size: 2.5rem;
          line-height: 0.95; letter-spacing: 0.02em; color: var(--fg); margin-bottom: 1.5rem;
        }
        .contact-desc { font-size: 0.9rem; color: var(--muted); line-height: 1.8; margin-bottom: 2rem; }
        .social-links { display: flex; flex-direction: column; gap: 0.5rem; }
        .social-link {
          display: flex; align-items: center; gap: 0.75rem;
          font-family: var(--font-comic); font-size: 0.95rem;
          color: var(--muted); text-decoration: none;
          border: 2px solid var(--border); padding: 0.5rem 0.9rem;
          transition: border-color 0.15s, color 0.15s;
        }
        .social-link:hover { border-color: var(--accent-mid); color: var(--fg); }
        .social-link .icon { color: var(--accent-mid); font-size: 1rem; width: 1.2rem; text-align: center; }
        .form-group { margin-bottom: 1.5rem; }
        .form-label {
          display: block; font-family: var(--font-comic); font-size: 0.85rem;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--accent-mid); margin-bottom: 0.4rem;
        }
        .form-input, .form-textarea {
          width: 100%; background: var(--surface); color: var(--fg);
          font-family: var(--font-body); font-size: 0.9rem;
          border: 2px solid var(--border); padding: 0.7rem 0.9rem;
          outline: none; transition: border-color 0.15s; resize: none;
        }
        .form-input:focus, .form-textarea:focus { border-color: var(--fg); }
        .form-textarea { min-height: 140px; }
        .form-error { font-family: var(--font-comic); font-size: 0.8rem; color: var(--accent); margin-top: 0.3rem; display: block; }
        .form-success {
          font-family: var(--font-comic); font-size: 1.1rem;
          color: var(--fg); text-align: center; padding: 2rem;
          border: 2px solid var(--fg); margin-top: 1rem;
        }
      `}</style>
    </>
  );
}
