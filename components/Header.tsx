'use client';

import Link from 'next/link';
import { ShoppingCart, Phone, MapPin, Clock } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useState, useEffect } from 'react';

export default function Header() {
  const { totalItems, totalPrice } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [cartAnimated, setCartAnimated] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (totalItems > 0) {
      setCartAnimated(true);
      const t = setTimeout(() => setCartAnimated(false), 300);
      return () => clearTimeout(t);
    }
  }, [totalItems]);

  const workHours = () => {
    const now = new Date();
    const h = now.getHours();
    return h >= 11 && h < 23;
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      maxWidth: '100%',
      zIndex: 1000,
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(13,13,13,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : 'none',
    }}>
      {/* Top promo bar */}
      <div className="header-promo-bar" style={{
        background: 'linear-gradient(90deg, var(--accent) 0%, #c1121f 100%)',
        padding: '6px 16px',
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.02em',
        width: '100%',
      }}>
        🚀 Безкоштовна доставка в радіусі 5 км <span className="hide-mobile">&nbsp;|&nbsp;
          <span style={{ opacity: 0.9 }}>Понад 5 км — 50% вартості таксі</span></span>
      </div>

      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 38,
            height: 38,
            background: 'linear-gradient(135deg, var(--accent) 0%, #c1121f 100%)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            boxShadow: 'var(--shadow-accent)',
            flexShrink: 0,
          }}>🍣</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              ТАК А ШО
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 500, textTransform: 'uppercase' }}>
              Доставка їжі
            </div>
          </div>
        </Link>

        {/* Center info — hidden on mobile */}
        <div className="header-center-info" style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13 }}>
            <MapPin size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span>вул. Едуарда Вільде, 10Б</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13 }}>
            <Clock size={14} style={{ color: workHours() ? '#48c774' : 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ color: workHours() ? '#48c774' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {workHours() ? 'Відчинено' : 'Зачинено'} • 11:00–23:00
            </span>
          </div>
        </div>

        {/* Right: Phone + Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <a href="tel:+380957972943" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
            transition: 'color 0.2s',
            minWidth: 40,
            minHeight: 40,
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <Phone size={18} />
          </a>

          <Link href="/cart" style={{ textDecoration: 'none' }}>
            <button
              id="cart-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: totalItems > 0
                  ? 'linear-gradient(135deg, var(--accent) 0%, #c1121f 100%)'
                  : 'var(--bg-card)',
                border: '1px solid',
                borderColor: totalItems > 0 ? 'transparent' : 'var(--border)',
                borderRadius: 10,
                padding: '8px 14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                animation: cartAnimated ? 'cartBounce 0.3s ease' : 'none',
                color: totalItems > 0 ? 'white' : 'var(--text-secondary)',
                minHeight: 40,
                whiteSpace: 'nowrap',
              }}
            >
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{totalPrice} ₴</span>
                  <span style={{
                    background: 'rgba(255,255,255,0.25)',
                    borderRadius: 100,
                    padding: '1px 6px',
                    fontSize: 12,
                    fontWeight: 700,
                  }}>{totalItems}</span>
                </>
              )}
              {totalItems === 0 && (
                <span className="hide-mobile" style={{ fontSize: 13, fontWeight: 500 }}>Кошик</span>
              )}
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
