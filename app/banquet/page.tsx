import Header from '@/components/Header';
import AnimatedPage, { ScrollToTop } from '@/components/AnimatedPage';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import nextDynamic from 'next/dynamic';
const ImageGallery = nextDynamic(() => import('@/components/ImageGallery'));
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Банкетне меню | Enot Sushi',
  description: 'Банкетне меню від Enot Sushi для ваших свят та заходів.',
};

import { createClient } from '@supabase/supabase-js';
import { DbCategory, DbMenuItem } from '@/lib/supabase';

export const revalidate = 60;

export default async function BanquetPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) }
    }
  );

  const [catRes, itemRes] = await Promise.all([
    supabase.from('menu_categories').select('*').order('sort_order'),
    supabase.from('menu_items').select('*').eq('is_available', true).order('sort_order'),
  ]);

  const categories = ((catRes.data as DbCategory[]) ?? []).filter(c => c.id.startsWith('banquet-'));
  const items = (itemRes.data as DbMenuItem[]) ?? [];
  return (
    <AnimatedPage>
      <main>
        <Header />
        
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
            <Link href="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 32,
            }}>
              <ChevronLeft size={18} />
              На головну
            </Link>

            <h1 className="section-title" style={{ fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: 16 }}>
              🥂 Банкетне меню
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, marginBottom: 40 }}>
              Спеціальне меню для ваших свят та заходів. Для замовлення або консультації щодо організації банкету, будь ласка, зв'яжіться з нами за телефоном.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              {categories.map((section, idx) => {
                const sectionItems = items.filter(i => i.category_id === section.id);
                if (sectionItems.length === 0) return null;
                
                return (
                  <div key={idx} className="reveal" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <h2 style={{ 
                      fontSize: 24, 
                      fontWeight: 800, 
                      color: 'var(--text-primary)', 
                      marginBottom: 20,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}>
                      <span>{section.emoji}</span>
                      {section.name}
                    </h2>
                    
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 24,
                      overflow: 'hidden',
                    }}>
                      {sectionItems.map((item, i) => (
                        <div key={i} className="banquet-row" style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px 20px',
                          borderBottom: i < sectionItems.length - 1 ? '1px dashed rgba(255,255,255,0.05)' : 'none',
                          transition: 'background 0.2s ease',
                        }}>
                          <span style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 500 }}>
                            {item.name}
                          </span>
                          <span style={{ 
                            fontSize: 15, 
                            color: 'var(--accent)', 
                            fontWeight: 700,
                            background: 'rgba(230,57,70,0.1)',
                            padding: '4px 10px',
                            borderRadius: 8,
                            whiteSpace: 'nowrap',
                            marginLeft: 12,
                          }}>
                            {item.price} ₴
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="reveal" style={{ 
              marginTop: 60, 
              padding: '30px 20px', 
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 24,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🦝🎉</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
                Особливий гість на вашому святі!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, marginBottom: 24, maxWidth: 600, margin: '0 auto 24px' }}>
                При замовленні банкету, дня народження або будь-якого свята — привітання від нашого <strong style={{ color: 'var(--text-primary)' }}>велетенського єнота-аніматора БЕЗКОШТОВНО!</strong>
              </p>
              
              <ImageGallery images={[1, 2, 3, 4].map(num => `/animator/animator-${num}.jpg`)} altPrefix="Єнот аніматор" />
            </div>
            
            <div className="reveal" style={{ marginTop: 60, textAlign: 'center' }}>
              <a href="tel:+380957972943" className="banquet-btn" style={{
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
                📞 Замовити банкет
              </a>
            </div>

          </div>
        </div>
        <ScrollToTop />
        <Footer />
        <style>{`
          .banquet-row:hover { background: rgba(255,255,255,0.04) !important; }
          .banquet-btn:hover {
            transform: translateY(-3px) !important;
            box-shadow: 0 12px 30px rgba(230, 57, 70, 0.6) !important;
          }
        `}</style>
      </main>
    </AnimatedPage>
  );
}
