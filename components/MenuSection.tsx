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
      <div style={{ marginBottom: 36, textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(230,57,70,0.1)',
          border: '1px solid rgba(230,57,70,0.2)',
          borderRadius: 100,
          padding: '5px 14px',
          fontSize: 13,
          color: 'var(--accent)',
          fontWeight: 600,
          marginBottom: 12,
        }}>
          🍽️ Наше меню
        </div>
        <h2 className="section-title" style={{ marginBottom: 8 }}>
          Замовляйте що завгодно
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
          {initialItems.length} страв на будь-який смак — суші, піца, бургери та більше
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto 28px' }}>
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
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
            padding: '13px 16px 13px 48px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: 15,
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      {/* Categories */}
      <div style={{ marginBottom: 36 }}>
        <CategoryFilter categories={initialCategories} activeCategory={activeCategory} onSelect={setActiveCategory} />
      </div>

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
    </section>
  );
}
