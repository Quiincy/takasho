'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, ShoppingCart, Phone } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useState, useEffect } from 'react';
import MobileMenu from './MobileMenu';
import { useSiteSettings } from '@/lib/settings-context';

export default function Header() {
  const { totalItems, totalPrice } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [cartAnimated, setCartAnimated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { contact_phone } = useSiteSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (totalItems > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCartAnimated(true);
      const t = setTimeout(() => setCartAnimated(false), 300);
      return () => clearTimeout(t);
    }
  }, [totalItems]);


  return (
    <header
      className={scrolled ? 'header-scrolled' : 'header-top'}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(13,13,13,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .header-top, .header-scrolled {
            background: rgba(13,13,13,0.97) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border-bottom: 1px solid var(--border) !important;
          }
        }
      `}</style>
      {/* Top promo bar */}
      <div className="header-promo-bar" style={{
        background: 'linear-gradient(90deg, var(--accent) 0%, #c1121f 100%)',
        padding: '6px 16px',
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.02em',
        width: '100%',
        color: '#ffffff',
      }}>
        🚕 Доставка за тарифом таксі <span className="hide-mobile">&nbsp;|&nbsp;
          <span style={{ opacity: 0.9 }}>Від 1000 грн — 50% оплачуємо ми 🎉</span></span>
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
          <Image 
            src="/logo_red.png" 
            alt="Enot Sushi Logo" 
            width={38} 
            height={38} 
            style={{ 
              borderRadius: 10, 
              objectFit: 'cover',
              boxShadow: 'var(--shadow-accent)',
            }} 
          />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              ENOT SUSHI
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 500, textTransform: 'uppercase' }}>
              Доставка їжі
            </div>
          </div>
        </Link>

        {/* Center nav links — hidden on mobile */}
        <nav className="header-center-info" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}>
          {[
            { href: '/', label: 'Головна' },
            { href: '/banquet', label: 'Банкетне меню' },
            { href: '/delivery', label: 'Доставка' },
            { href: '/contacts', label: 'Контакти' },
          ].map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Phone + Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <a href={`tel:${contact_phone.replace(/[^0-9+]/g, '')}`} aria-label="Зателефонувати" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
            transition: 'color 0.2s',
            minWidth: 48,
            minHeight: 48,
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <Phone size={18} />
          </a>

          {/* Cart Button */}
          <Link
            href="/cart"
            id="cart-button"
            aria-label="Перейти до кошика"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: totalItems > 0
                ? 'linear-gradient(135deg, var(--accent) 0%, #c1121f 100%)'
                : 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: totalItems > 0 ? 'transparent' : 'rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: '8px 14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              animation: cartAnimated ? 'cartBounce 0.3s ease' : 'none',
              color: totalItems > 0 ? 'white' : 'var(--text-secondary)',
              minHeight: 48,
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
          </Link>

          {/* Hamburger Menu - visible on all screens */}
          <button
            aria-label="Відкрити меню"
            onClick={() => setIsMobileMenuOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '12px',
              marginLeft: '4px',
            }}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  );
}
