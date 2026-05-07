'use client';

import { motion } from 'framer-motion';
import { Code2, Database, Layers, Zap } from 'lucide-react';
import { AnimatedText } from './AnimatedText';
import { useTranslations } from 'next-intl';

interface SkillsProps {
  animateSection?: string;
}

export default function Skills({ animateSection }: SkillsProps) {
  const t = useTranslations('skills');
  
  const skills = [
    {
      category: t('frontend.title'),
      icon: Code2,
      items: ['TypeScript', 'Next.js', 'React', 'Tailwind CSS'],
    },
    {
      category: t('backend.title'),
      icon: Database,
      items: ['Node.js', 'Python', 'Go', 'PostgreSQL'],
    },
    {
      category: t('architecture.title'),
      icon: Layers,
      items: ['DDD', 'SOLID', 'CQRS', 'Microservices'],
    },
    {
      category: t('devops.title'),
      icon: Zap,
      items: ['Docker', 'Kubernetes', 'CI/CD', 'AWS'],
    },
  ];

  return (
    <section className="skills-section">
      <div className="skills-inner">
        <div className="skills-header">
          <AnimatedText delay={0.1}>
            <div className="animate-clip-in">
              <h2 className="section-title">{t('title')}</h2>
            </div>
          </AnimatedText>
        </div>

        <div className="skills-grid">
          {skills.map((skill, index) => {
            const Icon = skill.icon;
            return (
              <motion.div
                key={skill.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="skill-card"
                suppressHydrationWarning
              >
                <div className="skill-card-header">
                  <div className="skill-icon">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="skill-category">{skill.category}</h3>
                </div>
                <ul className="skill-list">
                  {skill.items.map((item) => (
                    <li key={item} className="skill-item">
                      <span className="skill-dot" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
