'use client';

import { useEffect, useRef, useState } from 'react';

/* ─── Marquee ticker (like takasho.top background text) ─── */
const TICKER_ITEMS = ['🍣 СУШІ', '🍕 ПІЦА', '🍔 БУРГЕРИ', '🔥 ДОСТАВКА', '⚡ ВІД 1 ГОД', '💳 MONOBANK', '🎉 БЕЗКОШТОВНА ДОСТАВКА В РАДІУСІ 5 КМ'];

export function Marquee() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]; // duplicate for seamless loop
  return (
    <div
      style={{
        overflow: 'hidden',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        padding: '24px 0',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 0,
          animation: 'marquee 28s linear infinite',
          width: 'max-content',
        }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: 'var(--font-montserrat), sans-serif',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 900,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: i % 2 === 0 ? 'var(--text-primary)' : 'transparent',
              WebkitTextStroke: i % 2 === 0 ? 'none' : '1px var(--accent)',
              padding: '0 32px',
              whiteSpace: 'nowrap',
              opacity: 0.9,
            }}
          >
            {item}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ─── Scroll-reveal hook — adds .revealed class via IntersectionObserver ─── */
export function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─── Scroll-to-top button ─── */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <button
        aria-label="Повернутись вгору"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 24,
          zIndex: 999,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent) 0%, #c1121f 100%)',
          border: 'none',
          color: 'white',
          fontSize: 20,
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(230,57,70,0.45)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.85)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          pointerEvents: visible ? 'auto' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.85)'; }}
      >
        ↑
      </button>

      {/* Scroll-reveal global styles */}
      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.6s cubic-bezier(.16,1,.3,1), transform 0.6s cubic-bezier(.16,1,.3,1);
        }
        .reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }
      `}</style>
    </>
  );
}

/* ─── Root wrapper — activates everything ─── */
export default function AnimatedPage({ children }: { children: React.ReactNode }) {
  useScrollReveal();
  return <>{children}</>;
}
