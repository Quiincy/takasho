import Header from '@/components/Header';
import ContactMap from '@/components/ContactMap';
import { Metadata } from 'next';
import { MapPin, Phone } from 'lucide-react';
import Footer from '@/components/Footer';
import { createClient } from '@supabase/supabase-js';

export const metadata: Metadata = {
  title: 'Контакти — Enot Sushi | Доставка суші в Києві',
  description: 'Зв\'яжіться з нами для замовлення смачних суші, піци та бургерів.',
};

export const dynamic = 'force-dynamic';

export default async function ContactsPage() {
  const supabase = createClient(
    (process.env['NEXT_PUBLIC_SUPABASE_URL'] || 'https://placeholder.supabase.co'),
    (process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || 'placeholder'),
    {
      global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) }
    }
  );

  let contactPhone = '+380 95 797 29 43';
  let contactAddress = 'вул. Едуарда Вільде, 10Б, Дніпровський район, м. Київ';
  let contactSchedule = 'Пн-Нд: 10:00 – 21:00';

  try {
    const { data } = await supabase.from('site_settings').select('*');
    if (data) {
      const p = data.find(s => s.key === 'contact_phone')?.value;
      const a = data.find(s => s.key === 'contact_address')?.value;
      const s = data.find(s => s.key === 'contact_schedule')?.value;
      if (p) contactPhone = p;
      if (a) contactAddress = a;
      if (s) contactSchedule = s;
    }
  } catch (e) {
    console.error("Failed to load settings in contacts", e);
  }

  const INFO_CARDS = [
    {
      icon: '📍',
      title: 'Адреса',
      lines: [contactAddress],
      accent: false,
    },
    {
      icon: '📞',
      title: 'Телефон',
      lines: [contactPhone],
      link: `tel:${contactPhone.replace(/[^0-9+]/g, '')}`,
      accent: true,
    },
    {
      icon: '🕐',
      title: 'Графік роботи',
      lines: [contactSchedule],
      accent: false,
    },
    {
      icon: '✉️',
      title: 'Email',
      lines: ['hello@enotsushi.com.ua'],
      link: 'mailto:hello@enotsushi.com.ua',
      accent: false,
    },
  ];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Header />

      {/* Hero */}
      <section
        style={{
          paddingTop: 'clamp(100px, 15vw, 140px)',
          paddingBottom: 'clamp(40px, 6vw, 72px)',
          paddingLeft: 20,
          paddingRight: 20,
          textAlign: 'center',
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(230,57,70,0.12) 0%, transparent 70%)',
        }}
      >
        <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          🍣 Enot Sushi
        </p>
        <h1
          className="section-title"
          style={{ marginBottom: 16 }}
        >
          Контакти
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
          Ми завжди раді почути вас — зателефонуйте або напишіть нам
        </p>
      </section>

      {/* Info cards */}
      <section style={{ padding: '0 20px 60px', maxWidth: 1100, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
            marginBottom: 48,
          }}
        >
          {INFO_CARDS.map((card) => (
            <div
              key={card.title}
              className="card"
              style={{
                padding: '28px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                border: card.accent ? '1px solid rgba(230,57,70,0.3)' : '1px solid var(--border)',
                background: card.accent ? 'rgba(230,57,70,0.05)' : 'var(--bg-card)',
              }}
            >
              <div style={{ fontSize: 36 }}>{card.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {card.title}
              </div>
              {card.link ? (
                <a
                  href={card.link}
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--accent)',
                    textDecoration: 'none',
                    transition: 'opacity 0.2s',
                  }}
                >
                  {card.lines[0]}
                </a>
              ) : (
                card.lines.map((line) => (
                  <p key={line} style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {line}
                  </p>
                ))
              )}
            </div>
          ))}
        </div>

        {/* FOP Details */}
        <div style={{
          marginTop: 20,
          padding: '20px 24px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border)',
          fontSize: 14,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          textAlign: 'center',
        }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Юридична інформація</p>
          <p>ФОП Гулак Дмитро Сергійович</p>
          <p>ІПН / РНОКПП: 3139607532</p>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 48, flexWrap: 'wrap' }}>
          {/* Social */}
          <div
            className="card"
            style={{ flex: 1, minWidth: 260, padding: '28px 28px' }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
              Ми в соцмережах
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a
                href="https://www.instagram.com/enot_kava?igsh=b240ZjIyNGwyNTU1"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'rgba(225,48,108,0.08)',
                  border: '1px solid rgba(225,48,108,0.2)',
                  color: '#e1306c',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  transition: 'all 0.2s',
                }}
              >
                📸
                @enot_kava
              </a>
              <a
                href="https://www.instagram.com/tak_a_sho_kiev?igsh=eWp4eTV3bGh0d2R1"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'rgba(225,48,108,0.08)',
                  border: '1px solid rgba(225,48,108,0.2)',
                  color: '#e1306c',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  transition: 'all 0.2s',
                }}
              >
                📸
                @tak_a_sho_kiev
              </a>
              <a
                href="https://t.me/enot_kava"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'rgba(39,174,239,0.08)',
                  border: '1px solid rgba(39,174,239,0.2)',
                  color: '#27aeef',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  transition: 'all 0.2s',
                }}
              >
                ✈️
                Telegram-канал
              </a>
            </div>
          </div>

          {/* Call to action */}
          <div
            style={{
              flex: 1,
              minWidth: 260,
              padding: '28px 28px',
              borderRadius: 'var(--radius)',
              background: 'linear-gradient(135deg, rgba(230,57,70,0.15) 0%, rgba(193,18,31,0.08) 100%)',
              border: '1px solid rgba(230,57,70,0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <div style={{ fontSize: 32 }}>🛵</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>
                Безкоштовна доставка
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Безкоштовна доставка до 1 км при замовленні від 1000 грн. Мінімальна сума замовлення для доставки — 500 грн.
              </p>
            </div>
            <a
              href={`tel:${contactPhone.replace(/[^0-9+]/g, '')}`}
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 700,
                width: 'fit-content',
              }}
            >
              <Phone size={16} />
              Зателефонувати
            </a>
          </div>
        </div>

        {/* Map — Leaflet */}
        <div
          style={{
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              padding: '16px 24px',
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              color: 'var(--text-secondary)',
              fontWeight: 500,
            }}
          >
            <MapPin size={16} style={{ color: 'var(--accent)' }} />
            {contactAddress}
          </div>
          <ContactMap />
        </div>
      </section>

      <Footer />
    </main>
  );
}
