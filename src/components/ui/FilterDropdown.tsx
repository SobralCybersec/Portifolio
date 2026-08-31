'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface FilterOption {
  id: string;
  label: string;
  icon?: string;
}

interface FilterDropdownProps {
  options: FilterOption[];
  selected: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function FilterDropdown({ options, selected, onChange, placeholder = 'Select filter' }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.id === selected);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--theme-primary)] transition-colors min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon && (
            <Image src={selectedOption.icon} alt={selectedOption.label} width={20} height={20} className="object-contain" />
          )}
          <span className="text-sm font-semibold">{selectedOption?.label || placeholder}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {options.map(option => (
            <button
              key={option.id}
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--bg-hover)] transition-colors ${
                selected === option.id ? 'bg-[var(--bg-hover)] text-[var(--theme-primary)]' : 'text-[var(--text-primary)]'
              }`}
            >
              {option.icon && (
                <Image src={option.icon} alt={option.label} width={20} height={20} className="object-contain" />
              )}
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
