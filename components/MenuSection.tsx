'use client';

import MenuCard from '@/components/MenuCard';
import CategoryFilter from '@/components/CategoryFilter';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
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
  const subCategoryParam = searchParams.get('subCategory');

  const initialCatId = useMemo(() => {
    if (categoryParam) return categoryParam;
    if (categoryNameParam) {
      const match = initialCategories.find(c => c.name.toLowerCase().includes(categoryNameParam.toLowerCase()));
      if (match) return match.id;
    }
    return 'all';
  }, [categoryParam, categoryNameParam, initialCategories]);

  const [activeCategory, setActiveCategory] = useState(initialCatId);
  const [subCategory, setSubCategory] = useState<string>(subCategoryParam || 'all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const itemsPerPage = 12;

  // Track initial render to avoid resetting subCategory
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setSubCategory('all');
  }, [activeCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, subCategory, search]);

  // Sync the URL with the active category so that returning from the cart preserves the state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const newSearchParams = new URLSearchParams(window.location.search);
      if (activeCategory === 'all') {
        newSearchParams.delete('category');
        newSearchParams.delete('categoryName');
        newSearchParams.delete('subCategory');
      } else {
        newSearchParams.set('category', activeCategory);
        newSearchParams.delete('categoryName');
        if ((activeCategory === 'sushi' || activeCategory === 'drinks') && subCategory !== 'all') {
          newSearchParams.set('subCategory', subCategory);
        } else {
          newSearchParams.delete('subCategory');
        }
      }
      const searchString = newSearchParams.toString();
      const newUrl = searchString ? `${window.location.pathname}?${searchString}` : window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    }
  }, [activeCategory]);

  useEffect(() => {
    if (categoryParam || categoryNameParam) {
      setActiveCategory(initialCatId);
      if (subCategoryParam) setSubCategory(subCategoryParam);
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
    
    
    // Subcategory filtering
    if (activeCategory === 'sushi' && subCategory !== 'all') {
      items = items.filter(i => {
        const name = i.name.toLowerCase();
        const isSet = name.includes('сет');
        const isPhila = name.includes('філадельфія');
        const isCali = name.includes('каліфорнія');
        const isShawarma = name.includes('шаурма');
        const isBurger = name.includes('бургер');
        const isMaki = name.includes('макі');
        const isNigiri = name.includes('нігірі');
        const isChef = !isSet && !isPhila && !isCali && !isShawarma && !isBurger && !isMaki && !isNigiri;
        
        if (subCategory === 'sets') return isSet;
        if (subCategory === 'rolls') return !isSet;
        if (subCategory === 'phila') return isPhila;
        if (subCategory === 'cali') return isCali;
        if (subCategory === 'shawarma') return isShawarma;
        if (subCategory === 'burgers') return isBurger;
        if (subCategory === 'chef') return isChef;
        if (subCategory === 'maki') return isMaki;
        if (subCategory === 'nigiri') return isNigiri;
        
        return true;
      });
    }

    if (activeCategory === 'drinks' && subCategory !== 'all') {
      items = items.filter(i => {
        const name = i.name.toLowerCase();
        const isWater = name.includes('вода') || name.includes('bonaqua');
        const isSoda = name.includes('кока-кола') || name.includes('фанта') || name.includes('спрайт') || name.includes('лимонад') || name.includes('швепс');
        const isJuice = name.includes('сік') || name.includes('rich') || name.includes('садочок');
        const isCoffee = name.includes('кава') || name.includes('еспресо') || name.includes('американо') || name.includes('капучіно') || name.includes('латте') || name.includes('флет уайт') || name.includes('какао') || name.includes('шоколад');
        const isTea = name.includes('чай') || name.includes('матча');
        const isWine = name.includes('вино');
        const isCocktail = name.includes('коктейль') || name.includes('коктель') || name.includes('мохіто') || name.includes('сангрія') || name.includes('піна колада') || name.includes('bubble tea');
        
        if (subCategory === 'water') return isWater && !isSoda;
        if (subCategory === 'soda') return isSoda;
        if (subCategory === 'juice') return isJuice;
        if (subCategory === 'coffee') return isCoffee;
        if (subCategory === 'tea') return isTea;
        if (subCategory === 'wine') return isWine;
        if (subCategory === 'cocktails') return isCocktail;
        
        return true;
      });
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      items = items.filter(
        i => i.name.toLowerCase().includes(s) || (i.description && i.description.toLowerCase().includes(s))
      );
    }

    // Sort sets naturally by their name (e.g., Сет 1, Сет 2, Сет 3...)
    items = [...items].sort((a, b) => {
      const aIsSet = a.name.toLowerCase().includes('сет');
      const bIsSet = b.name.toLowerCase().includes('сет');
      
      if (aIsSet && bIsSet) {
        return a.name.localeCompare(b.name, 'uk', { numeric: true, sensitivity: 'base' });
      }
      return 0; // Preserve existing order for other items
    });

    return items;
  }, [activeCategory, subCategory, search, initialItems]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice(0, currentPage * itemsPerPage);

  const scrollToGrid = (customOffset?: number) => {
    setTimeout(() => {
      const anchor = document.getElementById('menu-grid-anchor');
      if (anchor) {
        // Use 100 for mobile (just header) and 190 for desktop (header + sticky filter)
        const offset = customOffset ?? (window.innerWidth <= 768 ? 100 : 190);
        const y = anchor.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };

  const catName = activeCategory === 'all'
    ? 'Все меню'
    : initialCategories.find(c => c.id === activeCategory)?.name ?? '';

  const handleCategorySelect = (id: string) => {
    setActiveCategory(id);
    setIsFilterOpen(false);
    
    // Scroll back to the top of the menu grid so the user sees the first items of the new category
    scrollToGrid();
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

      {/* Categories - Desktop Only */}
      <style>{`
        .sticky-filter-wrapper {
          position: sticky;
          top: 96px;
        }
        
        .animated-menu-btn {
          position: fixed;
          right: 0;
          top: 105px;
          z-index: 40;
          color: white;
          padding: 24px 0;
          width: 48px;
          border-radius: 14px 0 0 14px;
          font-weight: 800;
          font-size: 18px;
          cursor: pointer;
          border: none;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: var(--bg-card); /* Fallback */
          box-shadow: -4px 0 15px rgba(230, 57, 70, 0.3);
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        .animated-menu-btn::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(transparent 0%, transparent 30%, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3);
          animation: spin 3s linear infinite;
          z-index: 0;
          will-change: transform;
        }

        .animated-menu-btn::after {
          content: '';
          position: absolute;
          inset: 2px;
          right: 0;
          border-radius: 10px 0 0 10px;
          background: linear-gradient(to bottom, var(--accent) 0%, #c1121f 100%);
          z-index: 1;
        }

        .animated-menu-btn span.menu-text {
          position: relative;
          z-index: 2;
          transform: translateZ(0);
          backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div className="sticky-filter-wrapper hide-mobile" style={{
        marginBottom: 36,
        zIndex: 40,
        background: 'rgba(13, 13, 13, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '4px 20px 8px',
        margin: '0 -20px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <CategoryFilter categories={initialCategories} activeCategory={activeCategory} onSelect={handleCategorySelect} />
        
        {/* Subcategories for Sushi */}
        {activeCategory === 'sushi' && (
          <div className="sushi-sub-filter" style={{
            display: 'flex',
            gap: 8,
            marginTop: 8,
            overflowX: 'auto',
            paddingBottom: 2,
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}>
            <style>{`
              .sushi-sub-filter::-webkit-scrollbar { display: none; }
            `}</style>
            {[
              { id: 'all', label: 'Всі суші' },
              { id: 'rolls', label: '🍣 Всі роли' },
              { id: 'sets', label: '🍱 Сети' },
              { id: 'phila', label: '🧀 Філадельфія' },
              { id: 'cali', label: '🦀 Каліфорнія' },
              { id: 'shawarma', label: '🌯 Суші шаурма' },
              { id: 'burgers', label: '🍔 Суші бургери' },
              { id: 'chef', label: '👨‍🍳 Роли від шефа' },
              { id: 'maki', label: '🥒 Макі' },
              { id: 'nigiri', label: '🍣 Нігірі' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => {
                  setSubCategory(sub.id as any);
                  scrollToGrid();
                }}
                style={{
                  padding: '4px 12px',
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  border: '1px solid',
                  borderColor: subCategory === sub.id ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                  background: subCategory === sub.id ? 'var(--accent)' : 'transparent',
                  color: subCategory === sub.id ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}

        {/* Subcategories for Drinks */}
        {activeCategory === 'drinks' && (
          <div className="drinks-sub-filter" style={{
            display: 'flex',
            gap: 8,
            marginTop: 8,
            overflowX: 'auto',
            paddingBottom: 2,
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}>
            <style>{`
              .drinks-sub-filter::-webkit-scrollbar { display: none; }
            `}</style>
            {[
              { id: 'all', label: 'Всі напої' },
              { id: 'water', label: '💧 Вода' },
              { id: 'soda', label: '🥤 Солодка вода' },
              { id: 'juice', label: '🧃 Соки' },
              { id: 'coffee', label: '☕ Кава' },
              { id: 'tea', label: '🍵 Чай' },
              { id: 'cocktails', label: '🍹 Коктейлі' },
              { id: 'wine', label: '🍷 Вино' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => {
                  setSubCategory(sub.id);
                  scrollToGrid();
                }}
                style={{
                  padding: '4px 12px',
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  border: '1px solid',
                  borderColor: subCategory === sub.id ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                  background: subCategory === sub.id ? 'var(--accent)' : 'transparent',
                  color: subCategory === sub.id ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}




      </div>

      {/* Mobile Vertical Menu Trigger */}
      <button
        className="animated-menu-btn"
        style={{ display: 'flex' }}
        onClick={() => setIsFilterOpen(true)}
      >
        <span className="menu-text">
          <span>М</span>
          <span>Е</span>
          <span>Н</span>
          <span>Ю</span>
        </span>
      </button>

      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
        }}>
          {/* Backdrop */}
          <div 
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setIsFilterOpen(false)}
          />
          {/* Drawer Panel */}
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '280px',
            background: 'var(--bg-primary)',
            borderLeft: '1px solid var(--border)',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}>
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Фільтр меню</h3>
              <button onClick={() => setIsFilterOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: 4 }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => handleCategorySelect('all')}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  textAlign: 'left',
                  border: '1px solid',
                  borderColor: activeCategory === 'all' ? 'transparent' : 'rgba(255,255,255,0.08)',
                  background: activeCategory === 'all' ? 'linear-gradient(135deg, var(--accent) 0%, #c1121f 100%)' : 'rgba(255,255,255,0.03)',
                  color: activeCategory === 'all' ? 'white' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span>🍽️</span> Все меню
              </button>
              
              {initialCategories.map(cat => (
                <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    onClick={() => {
                      if (cat.id === 'sushi' && activeCategory !== 'sushi') {
                        setActiveCategory(cat.id);
                      } else {
                        handleCategorySelect(cat.id);
                      }
                    }}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 600,
                      textAlign: 'left',
                      border: '1px solid',
                      borderColor: activeCategory === cat.id ? 'transparent' : 'rgba(255,255,255,0.08)',
                      background: activeCategory === cat.id ? 'linear-gradient(135deg, var(--accent) 0%, #c1121f 100%)' : 'rgba(255,255,255,0.03)',
                      color: activeCategory === cat.id ? 'white' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <span>{cat.emoji}</span> {cat.name}
                  </button>
                  
                  {/* Nested Subcategories for Sushi */}
                  {cat.id === 'sushi' && activeCategory === 'sushi' && (
                    <div style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4, marginBottom: 8 }}>
                      {[
                        { id: 'all', label: 'Всі суші' },
                        { id: 'rolls', label: '🍣 Всі роли' },
                        { id: 'sets', label: '🍱 Сети' },
                        { id: 'phila', label: '🧀 Філадельфія' },
                        { id: 'cali', label: '🦀 Каліфорнія' },
                        { id: 'shawarma', label: '🌯 Суші шаурма' },
                        { id: 'burgers', label: '🍔 Суші бургери' },
                        { id: 'chef', label: '👨‍🍳 Роли від шефа' },
                        { id: 'maki', label: '🥒 Макі' },
                        { id: 'nigiri', label: '🍣 Нігірі' },
                      ].map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setSubCategory(sub.id as any);
                            setIsFilterOpen(false);
                            scrollToGrid();
                          }}
                          style={{
                            padding: '10px 16px',
                            borderRadius: 12,
                            fontSize: 14,
                            fontWeight: 600,
                            textAlign: 'left',
                            border: '1px solid',
                            borderColor: subCategory === sub.id ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                            background: subCategory === sub.id ? 'rgba(230,57,70,0.1)' : 'rgba(255,255,255,0.03)',
                            color: subCategory === sub.id ? 'var(--accent)' : 'var(--text-secondary)',
                            transition: 'all 0.2s',
                          }}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Nested Subcategories for Drinks */}
                  {cat.id === 'drinks' && activeCategory === 'drinks' && (
                    <div style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4, marginBottom: 8 }}>
                      {[
                        { id: 'all', label: 'Всі напої' },
                        { id: 'water', label: '💧 Вода' },
                        { id: 'soda', label: '🥤 Солодка вода' },
                        { id: 'juice', label: '🧃 Соки' },
                        { id: 'coffee', label: '☕ Кава' },
                        { id: 'tea', label: '🍵 Чай' },
                        { id: 'cocktails', label: '🍹 Коктейлі' },
                        { id: 'wine', label: '🍷 Вино' },
                      ].map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setSubCategory(sub.id);
                            setIsFilterOpen(false);
                            scrollToGrid();
                          }}
                          style={{
                            padding: '10px 16px',
                            borderRadius: 12,
                            fontSize: 14,
                            fontWeight: 600,
                            textAlign: 'left',
                            border: '1px solid',
                            borderColor: subCategory === sub.id ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                            background: subCategory === sub.id ? 'rgba(230,57,70,0.1)' : 'rgba(255,255,255,0.03)',
                            color: subCategory === sub.id ? 'var(--accent)' : 'var(--text-secondary)',
                            transition: 'all 0.2s',
                          }}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </div>
      )}

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
        <>
          <div
            className="menu-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 20,
            }}
          >
            {paginatedItems.map((item, idx) => (
              <MenuCard key={item.id} item={item} index={idx} />
            ))}
          </div>

          {/* "Show More" Button */}
          {currentPage < totalPages && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 40,
            }}>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                style={{
                  padding: '14px 32px',
                  borderRadius: 100,
                  border: '1px solid var(--accent)',
                  background: 'transparent',
                  color: 'var(--accent)',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 15px rgba(230,57,70,0.1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--accent)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(230,57,70,0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--accent)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(230,57,70,0.1)';
                }}
              >
                Показати ще ↓
              </button>
            </div>
          )}
        </>
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
