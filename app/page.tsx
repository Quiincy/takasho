import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MenuSection from '@/components/MenuSection';
import AnimatedPage, { Marquee, ScrollToTop } from '@/components/AnimatedPage';
import { createClient } from '@supabase/supabase-js';
import { DbCategory, DbMenuItem } from '@/lib/supabase';

export const revalidate = 60; // ISR revalidation every 60 seconds

export default async function HomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [catRes, itemRes] = await Promise.all([
    supabase.from('menu_categories').select('*').order('sort_order'),
    supabase.from('menu_items').select('*').eq('is_available', true).order('sort_order'),
  ]);

  const categories = (catRes.data as DbCategory[]) ?? [];
  const items = (itemRes.data as DbMenuItem[]) ?? [];

  return (
    <AnimatedPage>
      <main>
        <Header />
        <Hero />

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
                { icon: '🚴', title: 'Безкоштовна доставка', desc: 'В радіусі 5 км від ресторану — доставка в подарунок. Понад 5 км — платите лише 50% тарифу таксі.', delay: '' },
                { icon: '⚡', title: 'Швидко та гаряче',     desc: 'Ми готуємо авіакур\'єром. Від замовлення до вашого порога — від 1 години.',                       delay: 'reveal-delay-1' },
                { icon: '💳', title: 'Онлайн оплата Mono',   desc: 'Зручна оплата через Monobank. Картка, Apple Pay, Google Pay.',                                       delay: 'reveal-delay-2' },
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

        {/* ── Menu section ── */}
        <div className="reveal">
          <MenuSection initialCategories={categories} initialItems={items} />
        </div>

        {/* ── Footer ── */}
        <footer style={{
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          padding: '40px 20px',
        }}>
          <div
            className="footer-inner reveal"
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 32,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>🍣 ENOT SUSHI</div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                Доставка їжі в Києві • Суші, Піца, Бургери
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <a href="tel:+380957972943" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 15, fontWeight: 600 }}>
                📞 +380 95 797 29 43
              </a>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>📍 вул. Едуарда Вільде, 10Б, Київ</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>🕐 Пн-Нд: 11:00 – 23:00</span>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <a href="/delivery" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13 }}>🚴 Доставка та оплата</a>
              <a href="/contacts" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13 }}>📍 Контакти</a>
              <a href="/privacy-policy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13 }}>📋 Публічна оферта</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>© 2026 Enot Sushi. Всі права захищено.</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                Створено <a href="https://t.me/Quincyy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Quincy</a> з ❤️ в Україні.
              </div>
            </div>
          </div>
        </footer>

        <ScrollToTop />
      </main>
    </AnimatedPage>
  );
}
