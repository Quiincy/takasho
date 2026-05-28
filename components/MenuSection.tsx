'use client';

import MenuCard from '@/components/MenuCard';
import CategoryFilter from '@/components/CategoryFilter';
import { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { DbCategory, DbMenuItem } from '@/lib/supabase';

interface Props {
  initialCategories: DbCategory[];
  initialItems: DbMenuItem[];
}

export default function MenuSection({ initialCategories, initialItems }: Props) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const categoryNameParam = searchParams.get('categoryName');

  const initialCatId = useMemo(() => {
    if (categoryParam) return categoryParam;
    if (categoryNameParam) {
      const match = initialCategories.find(c => c.name.toLowerCase().includes(categoryNameParam.toLowerCase()));
      if (match) return match.id;
    }
    return 'all';
  }, [categoryParam, categoryNameParam, initialCategories]);

  const [activeCategory, setActiveCategory] = useState(initialCatId);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (categoryParam || categoryNameParam) {
      setActiveCategory(initialCatId);
      // Optional: smooth scroll to menu if a category is selected via URL
      const el = document.getElementById('menu');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [initialCatId, categoryParam, categoryNameParam]);

  const filtered = useMemo(() => {
    let items = initialItems;
    if (activeCategory !== 'all') {
      items = items.filter(i => i.category_id === activeCategory);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      items = items.filter(
        i => i.name.toLowerCase().includes(s) || (i.description && i.description.toLowerCase().includes(s))
      );
    }
    return items;
  }, [activeCategory, search, initialItems]);

  const catName = activeCategory === 'all'
    ? 'Все меню'
    : initialCategories.find(c => c.id === activeCategory)?.name ?? '';

  const handleCategorySelect = (id: string) => {
    setActiveCategory(id);
    
    // Scroll back to the top of the menu grid so the user sees the first items of the new category
    setTimeout(() => {
      const anchor = document.getElementById('menu-grid-anchor');
      if (anchor) {
        const offset = 170; // Header height + Sticky filter height
        const elementRect = anchor.getBoundingClientRect().top;
        
        // Only scroll if the grid is hidden behind the sticky filter (i.e., user scrolled down)
        if (elementRect < offset) {
          window.scrollBy({
            top: elementRect - offset,
            behavior: 'smooth'
          });
        }
      }
    }, 50);
  };

  return (
    <section
      id="menu"
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '60px 20px 80px',
      }}
      itemScope
      itemType="https://schema.org/Menu"
    >
      {/* Section header */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'linear-gradient(135deg, rgba(230,57,70,0.15) 0%, rgba(230,57,70,0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(230,57,70,0.2)',
          borderRadius: 100,
          padding: '6px 16px',
          fontSize: 14,
          color: '#ff4d5a',
          fontWeight: 700,
          marginBottom: 16,
          boxShadow: '0 4px 15px rgba(230,57,70,0.2)',
        }}>
          🍽️ Наше меню
        </div>
        <h2 className="section-title" style={{ 
          marginBottom: 12,
          background: 'linear-gradient(to right, #ffffff, #aaaaaa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 20px rgba(255,255,255,0.1)'
        }}>
          Замовляйте що завгодно
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
          {initialItems.length} страв на будь-який смак — суші, піца, бургери та більше
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto 32px' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--accent)',
          filter: 'blur(15px)',
          opacity: 0.05,
          borderRadius: '16px',
        }} />
        <Search
          size={20}
          style={{
            position: 'absolute',
            left: 18,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            zIndex: 1,
          }}
        />
        <input
          id="menu-search"
          type="text"
          placeholder="Пошук по меню..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '16px 16px 16px 52px',
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            color: 'var(--text-primary)',
            fontSize: 16,
            outline: 'none',
            transition: 'all 0.3s ease',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
            position: 'relative',
            zIndex: 1,
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(230, 57, 70, 0.5)';
            e.target.style.boxShadow = '0 0 15px rgba(230, 57, 70, 0.2), inset 0 2px 4px rgba(0,0,0,0.2)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(255,255,255,0.08)';
            e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)';
          }}
        />
      </div>

      {/* Categories */}
      <div style={{
        marginBottom: 36,
        position: 'sticky',
        top: 85,
        zIndex: 40,
        background: 'rgba(13, 13, 13, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '16px 20px',
        margin: '0 -20px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <CategoryFilter categories={initialCategories} activeCategory={activeCategory} onSelect={handleCategorySelect} />
      </div>

      <div id="menu-grid-anchor" style={{ position: 'relative', top: -10 }} />

      {/* Results count */}
      <div style={{
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <h3 style={{
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--text-primary)',
        }}>
          {catName}
        </h3>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          {filtered.length} {filtered.length === 1 ? 'страва' : filtered.length < 5 ? 'страви' : 'страв'}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p style={{ fontSize: 18 }}>Нічого не знайдено</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>Спробуйте інший запит або категорію</p>
        </div>
      ) : (
        <div
          className="menu-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {filtered.map((item, idx) => (
            <MenuCard key={item.id} item={item} index={idx} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div style={{
        marginTop: 40,
        textAlign: 'center',
        padding: '16px 20px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 16,
        border: '1px dashed rgba(255, 255, 255, 0.1)',
        color: 'var(--text-secondary)',
        fontSize: 14,
        maxWidth: 800,
        margin: '40px auto 0'
      }}>
        <span style={{ color: 'var(--accent)', fontWeight: 600, marginRight: 6 }}>⚠️ Зверніть увагу:</span>
        фотографії їжі в меню можуть дещо відрізнятися від приготованих страв у нашому ресторані.
      </div>
    </section>
  );
}
