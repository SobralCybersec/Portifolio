'use client';

import gsap from 'gsap';
import { ArrowUpRight, CheckCircle2, Clock3, Mail, Send } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent, PointerEvent } from 'react';
import MagneticButton from '@/components/ui/MagneticButton';
import ClickSpark from './ClickSpark';

interface ContactLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface ContactCommandFormProps {
  title: string;
  description: string;
  emailAddress: string;
  emailLabel: string;
  links: ContactLink[];
  accentColor?: string;
  copy?: Partial<ContactFormCopy>;
}

interface ContactFormCopy {
  transmission: string;
  identity: string;
  namePlaceholder: string;
  projectBrief: string;
  projectBriefPlaceholder: string;
  validationError: string;
  draftReady: string;
  openMailChannel: string;
  draftReadyButton: string;
  directChannel: string;
  responseWindow: string;
  opportunities: string;
}

type FormState = {
  name: string;
  email: string;
  message: string;
};

type SubmissionState = 'idle' | 'error' | 'ready';

const initialForm: FormState = { name: '', email: '', message: '' };

/** GSAP contact sequence with source-inspired field focus and canvas feedback. */
export default function ContactCommandForm({
  title,
  description,
  emailAddress,
  emailLabel,
  links,
  accentColor = '#a855f7',
  copy,
}: ContactCommandFormProps) {
  const rootRef = useRef<HTMLElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [activeField, setActiveField] = useState<keyof FormState | null>(null);
  const [submission, setSubmission] = useState<SubmissionState>('idle');
  const labels: ContactFormCopy = {
    transmission: 'TRANSMISSION / 01',
    identity: 'IDENTITY',
    namePlaceholder: 'Your name',
    projectBrief: 'PROJECT BRIEF',
    projectBriefPlaceholder: 'What are you building?',
    validationError: 'Complete name, valid email, and project brief.',
    draftReady: 'Mail draft ready.',
    openMailChannel: 'OPEN MAIL CHANNEL',
    draftReadyButton: 'DRAFT READY',
    directChannel: 'DIRECT CHANNEL',
    responseWindow: 'RESPONSE WINDOW',
    opportunities: 'Open to internship opportunities in software development and cybersecurity.',
    ...copy,
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo('[data-contact-shell]', { y: 56, rotateX: 7 }, { y: 0, rotateX: 0, duration: 0.9 })
        .fromTo('[data-contact-field]', { y: 22 }, { y: 0, duration: 0.55, stagger: 0.08 }, '-=0.45')
        .fromTo('[data-contact-meta]', { x: 28 }, { x: 0, duration: 0.65, stagger: 0.08 }, '-=0.3');
    }, root);

    return () => context.revert();
  }, []);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || !shellRef.current) return;
    const rect = shellRef.current.getBoundingClientRect();
    shellRef.current.style.setProperty('--contact-x', `${event.clientX - rect.left}px`);
    shellRef.current.style.setProperty('--contact-y', `${event.clientY - rect.top}px`);
  };

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSubmission('idle');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!form.name.trim() || !validEmail || !form.message.trim()) {
      setSubmission('error');
      return;
    }

    const subject = encodeURIComponent(`Portfolio contact from ${form.name.trim()}`);
    const body = encodeURIComponent(`${form.message.trim()}\n\nReply to: ${form.email.trim()}`);
    setSubmission('ready');
    window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
  };

  return (
    <section ref={rootRef} className="relative mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)] lg:gap-12" aria-label={title}>
      <div
        ref={shellRef}
        data-contact-shell
        onPointerMove={handlePointerMove}
        className="group relative overflow-hidden border border-[var(--border)] bg-[var(--bg-card)]/[0.82] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.2)] [background-image:radial-gradient(440px_circle_at_var(--contact-x,50%)_var(--contact-y,50%),rgba(168,85,247,0.13),transparent_72%)] sm:p-8 md:p-10"
        style={{ perspective: '1100px' }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--theme-primary)]/[0.08] via-transparent to-[var(--theme-accent)]/[0.06]" />
        <div className="pointer-events-none absolute left-0 top-0 h-px w-1/3 bg-[var(--theme-primary)] shadow-[0_0_18px_var(--theme-primary)]" />
        <form onSubmit={handleSubmit} className="relative z-10">
          <div className="mb-10 flex items-start justify-between gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--theme-primary)]">{labels.transmission}</p>
              <h2 className="mt-4 font-[var(--font-solo-heading)] text-3xl font-bold uppercase tracking-[0.08em] text-[var(--text-primary)] md:text-5xl">{title}</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-muted)] md:text-base">{description}</p>
            </div>
            <Mail className="mt-1 hidden h-7 w-7 shrink-0 text-[var(--theme-primary)] sm:block" aria-hidden="true" />
          </div>

          <ClickSpark sparkColor={accentColor} sparkRadius={22} sparkSize={8}>
            <div className="space-y-7">
              {([
                ['name', labels.identity, labels.namePlaceholder, 'text'] as const,
                ['email', emailLabel.toUpperCase(), 'you@example.com', 'email'] as const,
              ]).map(([field, label, placeholder, type]) => (
                <label key={field} data-contact-field className={`block border-b pb-3 transition-colors duration-300 ${activeField === field ? 'border-[var(--theme-primary)]' : 'border-[var(--border)]'}`}>
                  <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{label}</span>
                  <input
                    required
                    type={type}
                    value={form[field]}
                    onChange={(event) => handleFieldChange(field, event.target.value)}
                    onFocus={() => setActiveField(field)}
                    onBlur={() => setActiveField(null)}
                    placeholder={placeholder}
                    aria-label={label}
                    aria-invalid={submission === 'error' && !form[field]}
                    className="w-full bg-transparent text-base text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]/50"
                  />
                </label>
              ))}

              <label data-contact-field className={`block border-b pb-3 transition-colors duration-300 ${activeField === 'message' ? 'border-[var(--theme-primary)]' : 'border-[var(--border)]'}`}>
                <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{labels.projectBrief}</span>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(event) => handleFieldChange('message', event.target.value)}
                  onFocus={() => setActiveField('message')}
                  onBlur={() => setActiveField(null)}
                  placeholder={labels.projectBriefPlaceholder}
                  aria-label={labels.projectBrief}
                  aria-invalid={submission === 'error' && !form.message}
                  className="w-full resize-none bg-transparent text-base leading-7 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]/50"
                />
              </label>
            </div>
          </ClickSpark>

          <div className="mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div aria-live="polite" className="text-xs">
              {submission === 'error' && <span className="text-red-400">{labels.validationError}</span>}
              {submission === 'ready' && <span className="inline-flex items-center gap-2 text-[var(--theme-primary)]"><CheckCircle2 className="h-4 w-4" /> {labels.draftReady}</span>}
            </div>
            <MagneticButton type="submit" className="contact-cta m-0" disabled={submission === 'ready'}>
              <Send className="h-4 w-4" />
              <span>{submission === 'ready' ? labels.draftReadyButton : labels.openMailChannel}</span>
            </MagneticButton>
          </div>
        </form>
      </div>

      <aside className="flex flex-col gap-4">
        <div data-contact-meta className="border border-[var(--border)] bg-[var(--bg-card)]/[0.55] p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{labels.directChannel}</p>
          <a href={`mailto:${emailAddress}`} className="mt-4 flex items-center gap-3 break-all text-sm text-[var(--theme-primary)] transition-colors hover:text-[var(--text-primary)]">
            <Mail className="h-4 w-4 shrink-0" />
            <span>{emailAddress}</span>
          </a>
        </div>

        <div data-contact-meta className="border border-[var(--border)] bg-[var(--bg-card)]/[0.55] p-6">
          <div className="flex items-center gap-3 text-[var(--theme-accent)]">
            <Clock3 className="h-4 w-4" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">{labels.responseWindow}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{labels.opportunities}</p>
        </div>

        <div data-contact-meta className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isExternal = link.href.startsWith('http');
            return (
              <a
                key={link.label}
                href={link.href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="group flex items-center justify-between border border-[var(--border)] bg-[var(--bg-card)]/[0.55] px-5 py-4 text-[var(--text-muted)] transition-colors duration-300 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)]"
              >
                <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em]"><Icon className="h-4 w-4" />{link.label}</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
              </a>
            );
          })}
        </div>
      </aside>
    </section>
  );
}
