'use client';

import { DbCategory } from '@/lib/supabase';

interface Props {
  categories: DbCategory[];
  activeCategory: string;
  onSelect: (id: string) => void;
}

export default function CategoryFilter({ categories, activeCategory, onSelect }: Props) {
    return (
      <div className="category-scroll" style={{ paddingBottom: 8 }}>
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
            padding: '10px 20px',
            borderRadius: 100,
            border: '1px solid',
            borderColor: activeCategory === 'all' ? 'var(--accent)' : 'var(--border)',
            background: activeCategory === 'all'
              ? 'linear-gradient(135deg, var(--accent) 0%, #c1121f 100%)'
              : 'var(--bg-card)',
            color: activeCategory === 'all' ? 'white' : 'var(--text-secondary)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.25s ease',
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
              padding: '10px 20px',
              borderRadius: 100,
              border: '1px solid',
              borderColor: activeCategory === cat.id ? 'var(--accent)' : 'var(--border)',
              background: activeCategory === cat.id
                ? 'linear-gradient(135deg, var(--accent) 0%, #c1121f 100%)'
                : 'var(--bg-card)',
              color: activeCategory === cat.id ? 'white' : 'var(--text-secondary)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              if (activeCategory !== cat.id) {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--accent)';
              }
            }}
            onMouseLeave={e => {
              if (activeCategory !== cat.id) {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
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
