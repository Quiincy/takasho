import Header from '@/components/Header';
import ContactMap from '@/components/ContactMap';
import { Metadata } from 'next';
import { MapPin, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Контакти — Enot Sushi | Доставка суші в Києві',
  description: 'Адреса ресторану Enot Sushi: вул. Едуарда Вільде, 10Б, Київ. Телефон: +380 95 797 29 43. Працюємо щодня 11:00–23:00.',
};

const INFO_CARDS = [
  {
    icon: '📍',
    title: 'Адреса',
    lines: ['вул. Едуарда Вільде, 10Б', 'Київ, Деснянський район'],
    accent: false,
  },
  {
    icon: '📞',
    title: 'Телефон',
    lines: ['+380 95 797 29 43'],
    link: 'tel:+380957972943',
    accent: true,
  },
  {
    icon: '🕐',
    title: 'Графік роботи',
    lines: ['Пн – Нд: 11:00 – 23:00', 'Без вихідних'],
    accent: false,
  },
];

export default function ContactsPage() {
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
                href="https://instagram.com"
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
                @enotsushi
              </a>
              <a
                href="https://t.me/enotsushi"
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
                В радіусі 5 км від ресторану — доставка безкоштовна. Понад 5 км — 50% тарифу таксі.
              </p>
            </div>
            <a
              href="tel:+380957972943"
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
            вул. Едуарда Вільде, 10Б, Київ
          </div>
          <ContactMap />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '40px 20px' }}>
        <div
          className="footer-inner"
          style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>🍣 ENOT SUSHI</div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Доставка їжі в Києві • Суші, Піца, Бургери</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <a href="tel:+380957972943" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 15, fontWeight: 600 }}>📞 +380 95 797 29 43</a>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>📍 вул. Едуарда Вільде, 10Б, Київ</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>🕐 Пн-Нд: 11:00 – 23:00</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>© 2026 Enot Sushi. Всі права захищено.</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              Створено <a href="https://t.me/Quincyy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Quincy</a> з ❤️ в Україні.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
