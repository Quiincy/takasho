import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Image from 'next/image';
import { Suspense } from 'react';
import MenuSection from '@/components/MenuSection';
import AnimatedPage, { Marquee, ScrollToTop } from '@/components/AnimatedPage';
import nextDynamic from 'next/dynamic';
const ImageGallery = nextDynamic(() => import('@/components/ImageGallery'));
import Footer from '@/components/Footer';
import { createClient } from '@supabase/supabase-js';
import { DbCategory, DbMenuItem, DbSubcategory } from '@/lib/supabase';

export const revalidate = 60; // ISR revalidation every 60 seconds
// export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) }
    }
  );

  const [catRes, itemRes, subcatRes] = await Promise.all([
    supabase.from('menu_categories').select('*').order('sort_order'),
    supabase.from('menu_items').select('*').eq('is_available', true).order('sort_order'),
    supabase.from('menu_subcategories').select('*').order('sort_order'),
  ]);

  const categories = (catRes.data as DbCategory[]) ?? [];
  const items = (itemRes.data as DbMenuItem[]) ?? [];
  const subcategories = (subcatRes.data as DbSubcategory[]) ?? [];
  
  const deliveryCategories = categories.filter(c => !c.id.startsWith('banquet-'));
  const deliveryItems = items.filter(i => !i.category_id.startsWith('banquet-'));
  const popularItems = deliveryItems.filter(i => i.is_popular);

  return (
    <AnimatedPage>
      <main>
        <Header />
        <Hero popularItems={popularItems} />

        {/* ── Marquee ticker ── */}
        <Marquee />

        {/* ── Why us section ── */}
        <section style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          padding: 'clamp(40px, 6vw, 72px) 20px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Background watermark text */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 'clamp(80px, 14vw, 160px)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              color: 'rgba(255,255,255,0.022)',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            ENOT SUSHI
          </div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto' }}>
            <div className="reveal" style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>
                Чому обирають нас
              </p>
              <h2 className="section-title">Смачно. Швидко. Надійно.</h2>
            </div>

            <div
              className="features-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
              }}
            >
              {[
                { icon: '🚴', title: 'Безкоштовна доставка', desc: 'Безкоштовна доставка до 1 км при замовленні від 1000 грн. Мінімальна сума замовлення для доставки — 500 грн.', delay: '' },
                { icon: '⚡', title: 'Швидко та гаряче',     desc: 'Ми доставляємо курʼєром від замовлення до вашого порога - від 1 години.',                       delay: 'reveal-delay-1' },
                { icon: '💳', title: 'Безпечна оплата',      desc: 'Зручна та безпечна оплата замовлень онлайн через систему LiqPay.',                           delay: 'reveal-delay-2' },
                { icon: '🌟', title: 'Свіжі продукти',       desc: 'Лосось, морепродукти та всі інгредієнти — тільки преміальна свіжість.',                             delay: 'reveal-delay-3' },
              ].map(item => (
                <div
                  key={item.title}
                  className={`reveal ${item.delay} feature-card card`}
                  style={{ padding: 'clamp(14px, 3vw, 28px)', textAlign: 'center' }}
                >
                  <div className="feature-icon" style={{ fontSize: 40, marginBottom: 14 }}>{item.icon}</div>
                  <h3 className="feature-title" style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>
                    {item.title}
                  </h3>
                  <p
                    className="feature-desc"
                    style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <style>{`
            @media (max-width: 640px) {
              .features-grid {
                grid-template-columns: 1fr 1fr !important;
                gap: 10px !important;
              }
              .feature-card {
                text-align: left !important;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
              }
              .feature-icon { font-size: 26px !important; margin-bottom: 8px !important; }
              .feature-title { font-size: 13px !important; margin-bottom: 5px !important; }
              .feature-desc { font-size: 12px !important; line-height: 1.55 !important; }
            }
          `}</style>
        </section>

        {/* ── Second marquee between features and menu ── */}
        <Marquee />

        <div>
          <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>Завантаження меню...</div>}>
            <MenuSection initialCategories={deliveryCategories} initialItems={deliveryItems} initialSubcategories={subcategories} />
          </Suspense>
        </div>

        {/* ── Events & Catering ── */}
        <section className="reveal" style={{
          padding: 'clamp(40px, 6vw, 80px) 20px',
          background: 'linear-gradient(135deg, rgba(20,20,20,1) 0%, rgba(30,30,30,1) 100%)',
          position: 'relative',
          overflow: 'hidden',
          borderTop: '1px solid var(--border)',
        }}>
          {/* Decorative glow */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60%',
            height: '60%',
            background: 'var(--accent)',
            filter: 'blur(120px)',
            opacity: 0.05,
            pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 100,
              padding: '6px 16px',
              fontSize: 14,
              color: 'var(--text-secondary)',
              fontWeight: 600,
              marginBottom: 20,
            }}>
              🎉 Організація заходів
            </div>
            
            <h2 className="section-title" style={{ marginBottom: 24, fontSize: 'clamp(28px, 5vw, 42px)' }}>
              Свято там, де ви захочете
            </h2>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(16px, 2vw, 18px)', lineHeight: 1.7, marginBottom: 40, maxWidth: 800, margin: '0 auto 40px' }}>
              Ми з радістю допоможемо зробити вашу подію незабутньою! Організуємо неймовірно смачний стіл для будь-якого формату: 
              дні народження, банкети, весілля, виїзний фуршет чи професійний кейтеринг. 
            </p>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              justifyContent: 'center',
              marginBottom: 40
            }}>
              {['🎂 Дні народження', '🥂 Банкети', '💍 Весілля', '🍱 Кейтеринг', '🚙 Виїзний фуршет'].map(tag => (
                <div key={tag} style={{
                  padding: '12px 24px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 16,
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: 15,
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                }}>
                  {tag}
                </div>
              ))}
            </div>

            <a href="tel:+380957972943" className="events-btn" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: 'linear-gradient(135deg, var(--accent) 0%, #c1121f 100%)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: 100,
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 8px 25px rgba(230, 57, 70, 0.4)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}>
              📞 Замовити організацію
            </a>
          </div>
          <style>{`
            .events-btn:hover {
              transform: translateY(-3px) !important;
              box-shadow: 0 12px 30px rgba(230, 57, 70, 0.6) !important;
            }
          `}</style>
        </section>

        {/* ── Visit Us & Raccoon ── */}
        <section className="reveal" style={{
          padding: 'clamp(40px, 6vw, 60px) 20px',
          background: 'var(--bg-primary)',
          textAlign: 'center',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2 className="section-title" style={{ marginBottom: 16, fontSize: 'clamp(24px, 4vw, 36px)' }}>
              Завжди раді вам у нашому закладі!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>
              Ми не лише доставляємо найсмачнішу їжу, а й завжди раді бачити вас в гостях у нашому затишному ресторані. 
              Завітайте до нас, щоб відчути справжню атмосферу.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '16px 24px',
              borderRadius: 20,
              textAlign: 'left',
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 40 }}>🦝</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
                  А ще у нас живе справжній єнот Мотя!
                </div>
              </div>
            </div>

            <ImageGallery images={[1, 2, 3, 4].map(num => `/raccoon/motya-new-${num}.jpg`)} altPrefix="Єнот Мотя" />
          </div>
        </section>

        <Footer />

        <ScrollToTop />
      </main>
    </AnimatedPage>
  );
}
