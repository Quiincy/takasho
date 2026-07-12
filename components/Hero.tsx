'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, Clock, Bike, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';

/* ─── Data ──────────────────────────────────────────────────────────── */

const SLIDES = [
  { src: '/sushi_set2.png',        label: 'Преміум Сет',   price: '1500 ₴', cat: '🍣 Суші', query: 'Суші' },
  { src: '/pizza_shotlandska.png', label: 'Шотландська',   price: '280 ₴',  cat: '🍕 Піца', query: 'Піца' },
  { src: '/sushi_baked.png',       label: 'Запечений рол', price: '400 ₴',  cat: '🍣 Роли', query: 'Роли' },
  { src: '/pizza_bbq.png',         label: 'Барбекю',       price: '290 ₴',  cat: '🍕 Піца', query: 'Піца' },
];

// 4 cards shown in a 2×2 grid on mobile
const MOBILE_GRID = [
  { id: 'dragon', src: '/sushi_dragon.png',      label: 'Дракон',        price: 420 },
  { id: 'pepperoni', src: '/pizza_pepperoni.png',   label: 'Пепероні',      price: 270 },
  { id: 'california', src: '/sushi_california.png',  label: 'Каліфорнія',    price: 350 },
  { id: 'hot', src: '/sushi_hot.png',         label: 'Гарячий рол',   price: 380 },
];

/* ─── Component ─────────────────────────────────────────────────────── */

/* ── shared background decorations ── */
const Blobs = () => (
  <>
    <div style={{ position: 'absolute', top: '5%',  left: '-8%',  width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,57,70,0.13) 0%, transparent 70%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: '-8%', right: '5%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,57,70,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.013) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
  </>
);

const getCategoryMeta = (id: string) => {
  switch(id) {
    case 'pizza': return { cat: '🍕 Піца', query: 'pizza' };
    case 'sushi': return { cat: '🍣 Суші', query: 'sushi' };
    case 'burgers': return { cat: '🍔 Бургери', query: 'burgers' };
    case 'hot_appetizer': return { cat: '🔥 Гарячі', query: 'hot_appetizer' };
    case 'crisps': return { cat: '🍟 Хрустке', query: 'crisps' };
    case 'soups': return { cat: '🍲 Супи', query: 'soups' };
    case 'salad': return { cat: '🥗 Салати', query: 'salad' };
    case 'drinks': return { cat: '🥤 Напої', query: 'drinks' };
    case 'deserts': return { cat: '🍰 Десерти', query: 'deserts' };
    default: return { cat: '🍽️ Меню', query: id };
  }
};

export default function Hero({ popularItems = [] }: { popularItems?: any[] }) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const router = useRouter();
  const { addItem } = useCart();

  const actualSlides = popularItems.length > 0 
    ? popularItems.map(i => {
        const meta = getCategoryMeta(i.category_id);
        return {
          src: i.image,
          label: i.name,
          price: `${i.price} ₴`,
          cat: meta.cat,
          query: meta.query,
          id: i.id,
          weight: i.weight,
          rawPrice: i.price,
          categoryId: i.category_id
        };
      })
    : SLIDES.map(s => ({ ...s, id: 'test', weight: '1 порція', rawPrice: parseInt(s.price), categoryId: '' }));

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
    timer.current = setInterval(() => setActive(p => (p + 1) % actualSlides.length), 3200);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSlideClick = (slide: any) => {
    addItem({
      id: slide.id || 'test',
      name: slide.label,
      price: slide.rawPrice || parseInt(slide.price),
      image: slide.src,
      weight: slide.weight || '1 порція',
      category_id: slide.categoryId || '',
      description: null,
      is_available: true,
      sort_order: 0,
      created_at: new Date().toISOString()
    });
    router.push('/cart');
  };

  const handleMobileGridClick = (card: any) => {
    addItem({
      id: card.id,
      name: card.label,
      price: card.price,
      image: card.src,
      weight: card.weight || '1 порція',
      category_id: '',
      description: null,
      is_available: true,
      sort_order: 0,
      created_at: new Date().toISOString()
    });
    router.push('/cart');
  };

  const displayItems = popularItems.length > 0 
    ? popularItems.map(i => ({ id: i.id, src: i.image, label: i.name, price: i.price, weight: i.weight }))
    : MOBILE_GRID;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setActive(p => (p + 1) % actualSlides.length);
      } else {
        setActive(p => (p - 1 + actualSlides.length) % actualSlides.length);
      }
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(() => setActive(p => (p + 1) % actualSlides.length), 3200);
    }
    touchStartX.current = null;
  };

  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg,#0d0d0d 0%,#161616 40%,#1a0a0a 100%)',
    }}>
      <Blobs />

      {/* ══════════════════════════════════════════
          DESKTOP hero  (hidden on mobile via CSS)
         ══════════════════════════════════════════ */}
      <div className="hero-desktop" style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1280, margin: '0 auto',
        padding: 'clamp(110px,15vw,150px) 24px 80px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
        gap: 48,
        alignItems: 'center',
        minHeight: '100vh',
      }}>
        {/* Left: text */}
        <div>
          {/* badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(230,57,70,.12)', border: '1px solid rgba(230,57,70,.3)', borderRadius: 100, padding: '7px 18px', marginBottom: 28 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#48c774', boxShadow: '0 0 6px #48c774', animation: 'pulse 2s ease-in-out infinite', display: 'block' }} />
            <span style={{ fontSize: 13, color: 'var(--accent-light)', fontWeight: 600 }}>Доставка їжі в Києві • Вул. Едуарда Вільде, 10Б, Дніпровський р-н</span>
          </div>

          <h1 style={{ fontSize: 'clamp(38px,5.5vw,70px)', fontWeight: 900, lineHeight: 1.04, letterSpacing: '-.03em', marginBottom: 22, color: 'var(--text-primary)' }}>
            Суші. Піца.<br />
            <span style={{ background: 'linear-gradient(135deg,#e63946,#f4a261)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Бургери.</span>
            <span style={{ display: 'block', marginTop: 4 }}>Вже у вас вдома.</span>
          </h1>

          <p style={{ fontSize: 'clamp(15px,1.8vw,18px)', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 36, maxWidth: 480 }}>
            Свіжо, гаряче, смачно. Доставка 50/50 при замовленні від 1000 грн.
            Оплата на банківський рахунок або картку ФОП. Від 1 години до дверей.
          </p>

          {/* stats */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 36 }}>
            {[
              { icon: <Star size={14} />, text: '60+ страв' },
              { icon: <Clock size={14} />, text: 'Від 1 год' },
              { icon: <Bike size={14} />, text: '50/50 від 1000 грн' },
            ].map(s => (
              <div key={s.text} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 100, padding: '7px 14px', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>
                <span style={{ color: 'var(--accent)' }}>{s.icon}</span>{s.text}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button id="hero-order-btn" className="btn-primary" onClick={scrollToMenu} style={{ fontSize: 16, padding: '15px 32px', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12 }}>
              Замовити зараз <ArrowRight size={18} />
            </button>
            <a id="hero-call-btn" href="tel:+380957972943" className="btn-ghost" style={{ textDecoration: 'none', fontSize: 16, padding: '15px 28px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              📞 Зателефонувати
            </a>
          </div>
        </div>

        {/* Right: slideshow */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* Desktop left arrow */}
          <button 
            aria-label="Попередній слайд"
            className="hide-mobile"
            onClick={(e) => {
               e.stopPropagation();
               setActive(p => (p - 1 + actualSlides.length) % actualSlides.length);
               if (timer.current) clearInterval(timer.current);
               timer.current = setInterval(() => setActive(p => (p + 1) % actualSlides.length), 3200);
            }}
            style={{ position: 'absolute', left: -50, zIndex: 20, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.15)', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(230,57,70,.8)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
          >
            <ChevronLeft size={24} />
          </button>

          <div 
            onTouchStart={handleTouchStart} 
            onTouchEnd={handleTouchEnd}
            style={{ position: 'relative', width: '100%', maxWidth: 520, aspectRatio: '4/3', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)', boxShadow: '0 40px 80px rgba(0,0,0,.5)' }}
          >
            <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(230,57,70,.9)', backdropFilter: 'blur(10px)', padding: '6px 12px', borderRadius: 10, color: 'white', fontWeight: 800, fontSize: 13, zIndex: 11, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(0,0,0,.3)' }}>
              🔥 Популярне
            </div>
            {actualSlides.map((s, i) => (
              <button key={i} onClick={() => handleSlideClick(s)} style={{ position: 'absolute', inset: 0, opacity: i === active ? 1 : 0, transform: i === active ? 'scale(1)' : 'scale(1.04)', transition: 'opacity .7s ease, transform .7s ease', border: 'none', background: 'transparent', padding: 0, cursor: i === active ? 'pointer' : 'default', display: 'block', width: '100%', height: '100%', pointerEvents: i === active ? 'auto' : 'none', zIndex: i === active ? 2 : 1 }}>
                {i === 0 ? (
                  <Image src={s.src} alt={s.label} fill quality={60} priority={i === 0} fetchPriority={i === 0 ? 'high' : 'auto'} sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
                ) : (
                  <Image src={s.src} alt={s.label} fill quality={60} sizes="(max-width: 768px) 0vw, 520px" style={{ objectFit: 'cover' }} />
                )}
              </button>
            ))}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 50%)', pointerEvents: 'none', zIndex: 10 }} />
            <div style={{ position: 'absolute', bottom: 20, left: 20, pointerEvents: 'none', zIndex: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--accent-light)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>{actualSlides[active].cat}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: '-.02em' }}>{actualSlides[active].label}</span>
                <span style={{ background: 'rgba(230,57,70,.95)', backdropFilter: 'blur(10px)', borderRadius: 8, padding: '4px 10px', color: 'white', fontWeight: 800, fontSize: 16 }}>{actualSlides[active].price}</span>
              </span>
            </div>
            <div style={{ position: 'absolute', top: 14, right: 14, left: 14, display: 'flex', gap: 5, zIndex: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {actualSlides.map((_, i) => (
                <button key={i} aria-label={`Перейти до слайду ${i + 1}`} onClick={() => setActive(i)} style={{ width: i === active ? 20 : 8, height: 8, borderRadius: 100, background: i === active ? 'var(--accent)' : 'rgba(255,255,255,.3)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all .35s ease' }} />
              ))}
            </div>
          </div>

          {/* floating badges — desktop only */}
          <div className="hide-mobile" style={{ position: 'absolute', bottom: -16, right: -20, zIndex: 20, background: 'rgba(26,26,26,.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 20px 40px rgba(0,0,0,.4)', animation: 'float 4s ease-in-out infinite 2s' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,var(--accent),#c1121f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🚴</div>
            <div><div style={{ fontSize: 13, fontWeight: 700 }}>Оплата доставки 50/50</div><div style={{ fontSize: 11, color: '#48c774', fontWeight: 600 }}>при замовленні від 1000 грн</div></div>
          </div>


          {/* Desktop right arrow */}
          <button 
            aria-label="Наступний слайд"
            className="hide-mobile"
            onClick={(e) => {
               e.stopPropagation();
               setActive(p => (p + 1) % actualSlides.length);
               if (timer.current) clearInterval(timer.current);
               timer.current = setInterval(() => setActive(p => (p + 1) % actualSlides.length), 3200);
            }}
            style={{ position: 'absolute', right: -50, zIndex: 20, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.15)', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(230,57,70,.8)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE hero  (hidden on desktop via CSS)
         ══════════════════════════════════════════ */}
      <div className="hero-mobile" style={{ display: 'none', position: 'relative', zIndex: 1, minHeight: '100svh', flexDirection: 'column', paddingTop: 'var(--header-h, 88px)' }}>

        {/* Top: big food photo with overlay — clickable, scrolls to menu */}
        <div 
          onTouchStart={handleTouchStart} 
          onTouchEnd={handleTouchEnd}
          style={{ position: 'relative', width: '100%', aspectRatio: '3/2', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: 14, left: 16, background: 'rgba(230,57,70,.9)', backdropFilter: 'blur(10px)', padding: '5px 12px', borderRadius: 8, color: 'white', fontWeight: 800, fontSize: 12, zIndex: 11, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(0,0,0,.3)' }}>
            🔥 Популярне
          </div>
          {/* clickable overlay per slide */}
          {actualSlides.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSlideClick(s)}
              style={{
                position: 'absolute', inset: 0,
                opacity: i === active ? 1 : 0,
                transition: 'opacity .7s ease',
                border: 'none', padding: 0, cursor: i === active ? 'pointer' : 'default',
                background: 'none', display: 'block', width: '100%',
                pointerEvents: i === active ? 'auto' : 'none',
                zIndex: i === active ? 2 : 1
              }}
              aria-label={`Перейти до меню — ${s.label}`}
            >
              {i === 0 ? (
                <Image src={s.src} alt={s.label} fill quality={60} priority={i === 0} fetchPriority={i === 0 ? 'high' : 'auto'} sizes="100vw" style={{ objectFit: 'cover' }} />
              ) : (
                <Image src={s.src} alt={s.label} fill quality={60} sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
              )}
            </button>
          ))}
          {/* dark gradient bottom */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 35%, rgba(13,13,13,.95) 100%)', pointerEvents: 'none', zIndex: 10 }} />

          {/* slide dots */}
          <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', padding: '0 20px', gap: 6, pointerEvents: 'none', zIndex: 10 }}>
            {actualSlides.map((_, i) => (
              <div key={i} style={{ width: i === active ? 22 : 7, height: 7, borderRadius: 100, background: i === active ? 'var(--accent)' : 'rgba(255,255,255,.45)', transition: 'all .3s' }} />
            ))}
          </div>

          {/* active slide label */}
          <div style={{ position: 'absolute', bottom: 34, left: 18, pointerEvents: 'none', zIndex: 10 }}>
            <span style={{ fontSize: 11, color: 'var(--accent-light)', fontWeight: 700, letterSpacing: '.07em', display: 'block', marginBottom: 2 }}>{actualSlides[active].cat}</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{actualSlides[active].label}</span>
          </div>
          <div style={{ position: 'absolute', bottom: 38, right: 16, background: 'rgba(230,57,70,.95)', borderRadius: 10, padding: '6px 14px', color: 'white', fontWeight: 800, fontSize: 16, pointerEvents: 'none', zIndex: 10 }}>
            {actualSlides[active].price}
          </div>

          {/* tap hint */}
          <div style={{ position: 'absolute', top: 14, right: 64, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)', borderRadius: 20, padding: '4px 10px', fontSize: 11, color: 'rgba(255,255,255,.8)', fontWeight: 600, pointerEvents: 'none', zIndex: 10 }}>
            Натисни → меню
          </div>
        </div>

        {/* Middle: text */}
        <div style={{ padding: '20px 20px 0', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(230,57,70,.12)', border: '1px solid rgba(230,57,70,.25)', borderRadius: 100, padding: '5px 14px', marginBottom: 14 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#48c774', boxShadow: '0 0 5px #48c774', display: 'block', animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 12, color: 'var(--accent-light)', fontWeight: 600 }}>Доставка • Вул. Едуарда Вільде, 10Б, Дніпровський р-н</span>
          </div>

          <div aria-hidden="true" style={{ fontSize: 'clamp(28px,8vw,40px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-.03em', marginBottom: 10, color: 'var(--text-primary)' }}>
            Суші. Піца.<br />
            <span style={{ background: 'linear-gradient(135deg,#e63946,#f4a261)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Бургери.</span><br />
            Вже у вас вдома.
          </div>

          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 18 }}>
            Доставка за тарифом таксі. Від 1 години.
          </p>

          {/* stats row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { icon: <Star size={12} />, text: '60+ страв' },
              { icon: <Clock size={12} />, text: 'Від 1 год' },
              { icon: <Bike size={12} />, text: 'Від 1000 грн — 50/50' },
            ].map(s => (
              <div key={s.text} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 100, padding: '5px 12px', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}>
                <span style={{ color: 'var(--accent)' }}>{s.icon}</span>{s.text}
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            <button className="btn-primary" onClick={scrollToMenu} style={{ fontSize: 16, padding: '15px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14 }}>
              Замовити зараз <ArrowRight size={18} />
            </button>
            <a href="tel:+380957972943" className="btn-ghost" style={{ textDecoration: 'none', width: '100%', fontSize: 15, padding: '14px', borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              📞 Зателефонувати
            </a>
          </div>
        </div>

        {/* Scroll cue */}
        <button onClick={scrollToMenu} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, margin: '0 auto 24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, letterSpacing: '.06em', animation: 'float 2.5s ease-in-out infinite' }}>
          МЕНЮ <ChevronDown size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Desktop scroll cue */}
      <button
        className="hero-desktop-cue"
        onClick={scrollToMenu}
        style={{
          position: 'absolute', bottom: 28, left: 0, right: 0, margin: '0 auto',
          width: 'fit-content', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 11, animation: 'float 2.5s ease-in-out infinite',
          letterSpacing: '.05em', fontWeight: 600, padding: '8px 16px', borderRadius: 100,
          transition: 'color .2s', zIndex: 10,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        МЕНЮ <ChevronDown size={18} strokeWidth={1.5} />
      </button>

      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:.6; transform:scale(1.3); }
        }
        @keyframes float {
          0%,100% { transform:translateY(0); }
          50% { transform:translateY(-6px); }
        }
        /* ── mobile ── */
        @media (max-width: 768px) {
          .hero-desktop     { display: none !important; }
          .hero-mobile      { display: flex !important; }
          .hero-desktop-cue { display: none !important; }
          .hide-mobile      { display: none !important; }
        }
        /* ── desktop ── */
        @media (min-width: 769px) {
          .hero-mobile { display: none !important; }
        }
        /* scrollbar hide for mobile carousel */
        .mobile-carousel::-webkit-scrollbar { display: none; }
        .mobile-carousel { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
