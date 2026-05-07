'use client';

import { useEffect, useState } from 'react';

interface KeyboardNavProps {
  onMenuToggle?: () => void;
}

export default function KeyboardNav({ onMenuToggle }: KeyboardNavProps) {
  const [isScrolling, setIsScrolling] = useState(false);
  const sections = ['hero', 'skills', 'live', 'contact'];
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToSection = (direction: 'up' | 'down') => {
    if (isScrolling) return;
    
    setIsScrolling(true);
    
    let newIndex = currentIndex;
    if (direction === 'down' && currentIndex < sections.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }
    
    setCurrentIndex(newIndex);
    const element = document.getElementById(sections[newIndex]);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setTimeout(() => setIsScrolling(false), 800);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        scrollToSection('up');
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        scrollToSection('down');
      } else if (e.key === 'm') {
        e.preventDefault();
        onMenuToggle?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScrolling, currentIndex, onMenuToggle, sections]);

  return null;
}
