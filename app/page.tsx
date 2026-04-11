import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MenuSection from '@/components/MenuSection';
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
    <main>
      <Header />
      <Hero />

      {/* Why us section */}
      <section style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: 'clamp(28px, 5vw, 56px) 20px',
      }}>
        <div
          className="features-grid"
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {[
            { icon: '🚴', title: 'Безкоштовна доставка', desc: 'В радіусі 5 км від ресторану — доставка в подарунок. Понад 5 км — платите лише 50% тарифу таксі.' },
            { icon: '⚡', title: 'Швидко та гаряче',     desc: 'Ми готуємо авіакур&apos;єром. Від замовлення до вашого порога — 30-45 хвилин.' },
            { icon: '💳', title: 'Онлайн оплата Mono',   desc: 'Зручна оплата через Monobank. Картка, Apple Pay, Google Pay.' },
            { icon: '🌟', title: 'Свіжі продукти',       desc: 'Лосось, морепродукти та всі інгредієнти — тільки преміальна свіжість.' },
          ].map(item => (
            <div
              key={item.title}
              className="feature-card card"
              style={{ padding: 'clamp(14px, 3vw, 28px)', textAlign: 'center' }}
            >
              <div className="feature-icon" style={{ fontSize: 40, marginBottom: 14 }}>{item.icon}</div>
              <h3 className="feature-title" style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>
                {item.title}
              </h3>
              <p
                className="feature-desc"
                style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: item.desc }}
              />
            </div>
          ))}
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


      <MenuSection initialCategories={categories} initialItems={items} />

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        padding: '40px 20px',
      }}>
        <div
          className="footer-inner"
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
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>🍣 ТАК А ШО</div>
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
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            © 2024 Так а Шо. Всі права захищено.
          </div>
        </div>
      </footer>
    </main>
  );
}
