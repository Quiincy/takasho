'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ChevronRight } from 'lucide-react';

import { DbCategory } from '@/lib/supabase';
import { usePathname } from 'next/navigation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: Props) {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      fetch('/api/menu')
      .then(res => res.json())
      .then((data: any) => {
        if (data && Array.isArray(data.categories)) {
          const filtered = data.categories.filter((c: DbCategory) => !c.id.startsWith('banquet-'));
          setCategories(filtered);
        }
      })
      .catch(err => console.error("Error fetching categories:", err));
    }
  }, [isOpen, categories.length]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close menu on route change
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
      animation: 'fadeIn 0.3s ease',
    }}>
      {/* Header of mobile menu */}
      <div style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Меню
        </div>
        <button aria-label="Закрити меню" onClick={onClose} style={{
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '50%',
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          cursor: 'pointer',
        }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 40px' }}>
        {/* Main Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {[
            { href: '/', label: 'Головна', icon: '🏠' },
            { href: '/banquet', label: 'Банкетне меню', icon: '🥂' },
            { href: '/delivery', label: 'Доставка та оплата', icon: '🚴' },
            { href: '/contacts', label: 'Контакти', icon: '📍' },
          ].map(link => (
            <Link key={link.href} href={link.href} onClick={onClose} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 20px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 20,
              textDecoration: 'none',
              color: 'var(--text-primary)',
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 22 }}>{link.icon}</span>
                <span style={{ fontSize: 16 }}>{link.label}</span>
              </div>
              <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
            </Link>
          ))}
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: 4 }}>
          Що бажаєте замовити?
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}>
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.id}`}
              onClick={onClose}
              style={{
                textDecoration: 'none',
                animation: `fadeInUp 0.4s ease forwards`,
                animationDelay: `${i * 0.05}s`,
                opacity: 0,
              }}
            >
              <div className="mobile-cat-card">
                <div style={{
                  fontSize: 26,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cat.emoji}
                </div>
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  lineHeight: 1.2
                }}>
                  {cat.name}
                </div>
              </div>
            </Link>
          ))}
          {categories.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px' }}>
              Завантаження категорій...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
