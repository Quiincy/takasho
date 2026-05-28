'use client';

import { DbCategory } from '@/lib/supabase';
import { useEffect, useRef } from 'react';

interface Props {
  categories: DbCategory[];
  activeCategory: string;
  onSelect: (id: string) => void;
}

export default function CategoryFilter({ categories, activeCategory, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeEl = document.getElementById(activeCategory === 'all' ? 'cat-all' : `cat-${activeCategory}`);
    if (activeEl && scrollRef.current) {
      const container = scrollRef.current;
      const scrollLeft = activeEl.offsetLeft - container.offsetWidth / 2 + activeEl.offsetWidth / 2;
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [activeCategory]);

  return (
    <div className="category-scroll" ref={scrollRef} style={{ paddingBottom: 8, position: 'relative' }}>
      <div style={{
        display: 'flex',
        gap: 8,
        minWidth: 'max-content',
      }}>
        <button
          id="cat-all"
          onClick={() => onSelect('all')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 100,
            border: '1px solid',
            borderColor: activeCategory === 'all' ? 'transparent' : 'rgba(255,255,255,0.08)',
            background: activeCategory === 'all'
              ? 'linear-gradient(135deg, var(--accent) 0%, #c1121f 100%)'
              : 'rgba(255,255,255,0.03)',
            color: activeCategory === 'all' ? 'white' : 'var(--text-secondary)',
            boxShadow: activeCategory === 'all' ? '0 4px 15px rgba(230,57,70,0.4)' : 'none',
            backdropFilter: 'blur(10px)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
          }}
        >
          🍽️ Все меню
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            id={`cat-${cat.id}`}
            onClick={() => onSelect(cat.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 100,
              border: '1px solid',
              borderColor: activeCategory === cat.id ? 'transparent' : 'rgba(255,255,255,0.08)',
              background: activeCategory === cat.id
                ? 'linear-gradient(135deg, var(--accent) 0%, #c1121f 100%)'
                : 'rgba(255,255,255,0.03)',
              color: activeCategory === cat.id ? 'white' : 'var(--text-secondary)',
              boxShadow: activeCategory === cat.id ? '0 4px 15px rgba(230,57,70,0.4)' : 'none',
              backdropFilter: 'blur(10px)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              if (activeCategory !== cat.id) {
                e.currentTarget.style.borderColor = 'rgba(230, 57, 70, 0.5)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              }
            }}
            onMouseLeave={e => {
              if (activeCategory !== cat.id) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }
            }}
          >
            <span>{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
