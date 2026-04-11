'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, Clock, Bike, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const FOOD_CARDS = [
  { src: '/sushi_set2.png',        label: 'Преміум Сет',     price: '1500 ₴', cat: '🍣 Суші' },
  { src: '/pizza_shotlandska.png', label: 'Шотландська',     price: '280 ₴',  cat: '🍕 Піца' },
  { src: '/sushi_baked.png',       label: 'Запечений рол',   price: '400 ₴',  cat: '🍣 Роли' },
  { src: '/pizza_bbq.png',         label: 'Барбекю',         price: '290 ₴',  cat: '🍕 Піца' },
];

const MOBILE_STRIP = [
  { src: '/sushi_dragon.png',      label: 'Дракон',          price: '420 ₴',  cat: '🍣' },
  { src: '/pizza_pepperoni.png',   label: 'Пепероні',        price: '270 ₴',  cat: '🍕' },
  { src: '/sushi_california.png',  label: 'Каліфорнія',      price: '350 ₴',  cat: '🍣' },
  { src: '/sushi_hot.png',         label: 'Гарячий рол',     price: '380 ₴',  cat: '🍣' },
  { src: '/pizza_four_cheese.png', label: 'Чотири сири',     price: '290 ₴',  cat: '🍕' },
  { src: '/sushi_kyiv.png',        label: 'Київський',       price: '390 ₴',  cat: '🍣' },
];

export default function Hero() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // fade in
    const t = setTimeout(() => setVisible(true), 100);
    // auto-rotate cards
    ref.current = setInterval(() => setActive(p => (p + 1) % FOOD_CARDS.length), 3000);
    return () => {
      clearTimeout(t);
      if (ref.current) clearInterval(ref.current);
    };
  }, []);

  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0d0d0d 0%, #161616 40%, #1a0a0a 100%)',
    }}>

      {/* Decorative ambient blobs */}
      <div style={{
        position: 'absolute', top: '10%', left: '-5%',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(230,57,70,0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '10%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(230,57,70,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '-5%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(244,162,97,0.06) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Grid pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Main content */}
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1280, margin: '0 auto',
        padding: 'clamp(100px, 15vw, 140px) 24px 60px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
        gap: 40,
        alignItems: 'center',
      }}
        className="hero-grid"
      >
        {/* LEFT: Text */}
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(230,57,70,0.12)',
            border: '1px solid rgba(230,57,70,0.3)',
            borderRadius: 100, padding: '7px 18px', marginBottom: 28,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#48c774',
              boxShadow: '0 0 6px #48c774',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
              Доставка їжі в Києві • Вул. Едуарда Вільде, 10Б
            </span>
          </div>

          {/* H1 */}
          <h1 style={{
            fontSize: 'clamp(36px, 5.5vw, 68px)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            marginBottom: 22,
            color: 'var(--text-primary)',
          }}>
            Суші. Піца.<br />
            <span style={{
              background: 'linear-gradient(135deg, #e63946 0%, #f4a261 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Бургери.</span>
            <span style={{ display: 'block', marginTop: 4 }}>
              Вже у вас вдома.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 1.8vw, 18px)',
            color: 'var(--text-secondary)',
            lineHeight: 1.75,
            marginBottom: 36,
            maxWidth: 480,
          }}>
            Свіжо, гаряче, смачно. Безкоштовна доставка в радіусі&nbsp;5&nbsp;км.
            Онлайн оплата Monobank. Від 30 хвилин до вашого порога.
          </p>

          {/* Stats row */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 36,
          }}>
            {[
              { icon: <Star size={14} />, text: '60+ страв' },
              { icon: <Clock size={14} />, text: 'Від 30 хв' },
              { icon: <Bike size={14} />, text: 'Безкоштовно до 5 км' },
            ].map(s => (
              <div key={s.text} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 100, padding: '7px 14px',
                color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
              }}>
                <span style={{ color: 'var(--accent)' }}>{s.icon}</span>
                {s.text}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="hero-buttons" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="#menu" style={{ textDecoration: 'none' }}>
              <button id="hero-order-btn" className="btn-primary" style={{
                fontSize: 16, padding: '15px 32px',
                display: 'flex', alignItems: 'center', gap: 8,
                borderRadius: 12,
              }}>
                Замовити зараз <ArrowRight size={18} />
              </button>
            </Link>
            <a href="tel:+380957972943" style={{ textDecoration: 'none' }}>
              <button id="hero-call-btn" className="btn-ghost" style={{
                fontSize: 16, padding: '15px 28px', borderRadius: 12,
              }}>
                📞 Зателефонувати
              </button>
            </a>
          </div>
        </div>


        {/* RIGHT: Food showcase */}
        <div style={{
          position: 'relative',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s',
        }}
          className="hero-visual"
        >
          {/* Main featured image */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: 520,
            aspectRatio: '4/3',
            borderRadius: 24,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(230,57,70,0.1)',
          }}>
            {FOOD_CARDS.map((card, i) => (
              <div key={i} style={{
                position: 'absolute', inset: 0,
                opacity: i === active ? 1 : 0,
                transform: i === active ? 'scale(1)' : 'scale(1.04)',
                transition: 'opacity 0.7s ease, transform 0.7s ease',
              }}>
                <Image
                  src={card.src}
                  alt={card.label}
                  fill
                  priority={i === 0}
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
            {/* Gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
            }} />
            {/* Current card label */}
            <div style={{
              position: 'absolute', bottom: 20, left: 20,
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <span style={{
                fontSize: 11, color: 'var(--accent)', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>{FOOD_CARDS[active].cat}</span>
              <span style={{
                fontSize: 22, fontWeight: 800, color: 'white',
                letterSpacing: '-0.02em',
              }}>{FOOD_CARDS[active].label}</span>
            </div>
            {/* Price tag */}
            <div style={{
              position: 'absolute', bottom: 20, right: 20,
              background: 'rgba(230,57,70,0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: 12, padding: '8px 16px',
              color: 'white', fontWeight: 800, fontSize: 18,
              boxShadow: '0 4px 20px rgba(230,57,70,0.4)',
            }}>
              {FOOD_CARDS[active].price}
            </div>
            {/* Dots */}
            <div style={{
              position: 'absolute', top: 16, right: 16,
              display: 'flex', gap: 6,
            }}>
              {FOOD_CARDS.map((_, i) => (
                <button key={i} onClick={() => setActive(i)} style={{
                  width: i === active ? 20 : 8, height: 8,
                  borderRadius: 100,
                  background: i === active ? 'var(--accent)' : 'rgba(255,255,255,0.3)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'all 0.35s ease',
                }} />
              ))}
            </div>
          </div>

          {/* Floating mini cards */}
          <div style={{
            position: 'absolute', top: -16, left: -20,
            background: 'rgba(26,26,26,0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            animation: 'float 4s ease-in-out infinite',
          }}
            className="hide-mobile"
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10, overflow: 'hidden',
              position: 'relative', flexShrink: 0,
            }}>
              <Image src="/sushi_dragon.png" alt="dragon roll" fill style={{ objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Золотий Дракон</div>
              <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>420 ₴ • 🍣 Суші</div>
            </div>
          </div>

          <div style={{
            position: 'absolute', bottom: -16, right: -20,
            background: 'rgba(26,26,26,0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            animation: 'float 4s ease-in-out infinite 2s',
          }}
            className="hide-mobile"
          >
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg, var(--accent), #c1121f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0,
            }}>🚴</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Безкоштовна доставка</div>
              <div style={{ fontSize: 11, color: '#48c774', fontWeight: 600 }}>в радіусі 5 км від нас</div>
            </div>
          </div>

          {/* Rating badge */}
          <div style={{
            position: 'absolute', top: -16, right: -10,
            background: 'rgba(26,26,26,0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          }}
            className="hide-mobile"
          >
            <span style={{ fontSize: 18 }}>⭐️</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>4.9</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>200+ відгуків</div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE ONLY: horizontal food strip — outside grid */}
      <div className="hero-mobile-strip" style={{ display: 'none', position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          paddingBottom: 8,
          paddingLeft: 24,
          paddingRight: 24,
          marginTop: -20,
          marginBottom: 60,
        } as React.CSSProperties}>
          {MOBILE_STRIP.map((card, i) => (
            <div key={i} style={{
              flexShrink: 0,
              width: 140,
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(26,26,26,0.85)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              <div style={{ position: 'relative', height: 110 }}>
                <Image
                  src={card.src}
                  alt={card.label}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)',
                }} />
                <div style={{
                  position: 'absolute', bottom: 8, left: 10,
                  fontSize: 14, fontWeight: 700,
                }}>{card.cat}</div>
              </div>
              <div style={{ padding: '10px 12px 14px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {card.label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent)' }}>
                  {card.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <button
        onClick={() => {
          const el = document.getElementById('menu');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        style={{
          position: 'absolute',
          bottom: 28,
          left: 0,
          right: 0,
          margin: '0 auto',
          width: 'fit-content',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          color: 'var(--text-muted)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 11,
          animation: 'float 2.5s ease-in-out infinite',
          letterSpacing: '0.05em',
          fontWeight: 600,
          padding: '8px 16px',
          borderRadius: 100,
          transition: 'color 0.2s',
          zIndex: 10,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        МЕНЮ
        <ChevronDown size={18} strokeWidth={1.5} />
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .hero-visual {
            display: none !important;
          }
          .hero-mobile-strip {
            display: block !important;
          }
          .hero-mobile-strip [style*="display: flex"] {
            justify-content: flex-start;
          }
          .hero-mobile-strip::-webkit-scrollbar { display: none; }
        }
      `}</style>
    </section>
  );
}
