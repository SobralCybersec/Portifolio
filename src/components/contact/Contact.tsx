'use client';

import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Twitter } from 'lucide-react';
import dynamic from 'next/dynamic';
import { AnimatedText } from '@/components/texts/AnimatedText';
import { useTranslations } from 'next-intl';
import MagneticButton from '@/components/ui/MagneticButton';
import ScrollReveal from '@/components/effects/ScrollReveal';

const ParticleBackground = dynamic(() => import('@/components/effects/ParticleBackground'), { ssr: false });

interface ContactProps {
  animateSection?: string;
}

export default function Contact({ animateSection }: ContactProps) {
  const t = useTranslations('contact');
  const socials = [
    { icon: Github, label: t('github'), href: 'https://github.com/SobralCybersec' },
    { icon: Linkedin, label: t('linkedin'), href: 'https://www.linkedin.com/in/matheus-sobral-b17a5b1b9/' },
    { icon: Mail, label: t('email'), href: 'mailto:matheussobrallinkedin@gmail.com' },
  ];
  
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
            <ScrollReveal textClassName="contact-desc" containerClassName="max-w-[600px]">
              {t('description')}
            </ScrollReveal>
          </AnimatedText>

          <AnimatedText delay={0.3}>
            <MagneticButton href="mailto:matheussobrallinkedin@gmail.com" variant="outline" className="contact-cta animate-clip-in-delay">
              <Mail className="w-4 h-4" />
              matheussobrallinkedin@gmail.com
            </MagneticButton>
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
