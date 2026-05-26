'use client';

import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Twitter } from 'lucide-react';
import dynamic from 'next/dynamic';
import { AnimatedText } from './AnimatedText';
import { useTranslations } from 'next-intl';

const ParticleBackground = dynamic(() => import('./ParticleBackground'), { ssr: false });

interface ContactProps {
  animateSection?: string;
}

const socials = [
  { icon: Github,   label: 'GitHub',   href: 'https://github.com/SobralCybersec' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/matheus-sobral-b17a5b1b9/' },
  { icon: Mail,     label: 'Email',    href: 'mailto:matheussobrallinkedin@gmail.com' },
];

export default function Contact({ animateSection }: ContactProps) {
  const t = useTranslations('contact');
  
  return (
    <section className="contact-section relative overflow-hidden">
      <ParticleBackground />
      <div className="contact-inner relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="contact-content"
          suppressHydrationWarning
        >
                    
          <AnimatedText delay={0.1}>
            <div className="animate-clip-in">
              <h2 className="contact-title">{t('title')}</h2>
            </div>
          </AnimatedText>
          
          <AnimatedText delay={0.2}>
            <p className="contact-desc">
              {t('description')}
            </p>
          </AnimatedText>

          <AnimatedText delay={0.3}>
            <a href="mailto:matheussobrallinkedin@gmail.com" className="contact-cta animate-clip-in-delay">
              <Mail className="w-4 h-4" />
              matheussobrallinkedin@gmail.com
            </a>
          </AnimatedText>

          <div className="contact-socials">
            {socials.map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ delay: 0.4 + index * 0.08, duration: 0.4 }}
                  className="contact-social-link"
                  aria-label={social.label}
                >
                  <Icon className="w-5 h-5" />
                  <span>{social.label}</span>
                </motion.a>
              );
            })}
          </div>

          <AnimatedText delay={0.7}>
            <p className="contact-footer">{t('footer')}</p>
          </AnimatedText>
        </motion.div>
      </div>
    </section>
  );
}
