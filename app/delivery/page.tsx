import Header from '@/components/Header';
import { Metadata } from 'next';
import { CheckCircle, MapPin, CreditCard, Banknote, Clock, AlertCircle } from 'lucide-react';
import Footer from '@/components/Footer';
import { createClient } from '@supabase/supabase-js';

export const metadata: Metadata = {
  title: 'Доставка та оплата — Enot Sushi | Безкоштовна доставка їжі в Києві',
  description: 'Умови доставки Enot Sushi в Києві: безкоштовно в радіусі 1 км, онлайн оплата через LiqPay. Доставка від 1 години. Мінімальне замовлення 500 грн.',
};

export const dynamic = 'force-dynamic';

export default async function DeliveryPage() {
  const supabase = createClient(
    (process.env['NEXT_PUBLIC_SUPABASE_URL'] || 'https://placeholder.supabase.co'),
    (process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || 'placeholder'),
    {
      global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) }
    }
  );

  let contactPhone = '+380 95 797 29 43';
  let contactAddress = 'вул. Едуарда Вільде, 10Б, Дніпровський район, м. Київ';

  try {
    const { data } = await supabase.from('site_settings').select('*');
    if (data) {
      const p = data.find(s => s.key === 'contact_phone')?.value;
      const a = data.find(s => s.key === 'contact_address')?.value;
      if (p) contactPhone = p;
      if (a) contactAddress = a;
    }
  } catch (e) {
    console.error("Failed to load settings in delivery", e);
  }

  const shortAddress = contactAddress.split(',')[0]; // Extract just the street part for short display

  const DELIVERY_ZONES = [
    { zone: 'До 1 км (від 1000 грн)', price: 'Безкоштовно 🎉', color: '#48c774', bg: 'rgba(72,199,116,0.08)', border: 'rgba(72,199,116,0.25)' },
    { zone: 'Більше 1 км', price: 'За тарифом таксі', color: 'var(--accent-gold)', bg: 'rgba(244,162,97,0.08)', border: 'rgba(244,162,97,0.25)' },
    { zone: `Самовивіз (${shortAddress})`, price: 'Безкоштовно', color: 'var(--text-secondary)', bg: 'var(--bg-card)', border: 'var(--border)' },
  ];

const PAYMENT_METHODS = [
  {
    icon: '💳',
    title: 'Онлайн оплата LiqPay',
    desc: 'Безпечна та швидка онлайн оплата банківською карткою Visa/Mastercard відразу при оформленні замовлення.',
    badge: 'Безпечно',
    badgeColor: '#48c774',
    badgeBg: 'rgba(72,199,116,0.15)',
  }
];

const FAQ = [
  {
    q: 'Яке мінімальне замовлення для доставки?',
    a: 'Мінімальна сума замовлення для доставки по Києву — 500 грн. Для самовивозу мінімальної суми немає.',
  },
  {
    q: 'Скільки часу займає доставка?',
    a: 'Зазвичай доставка займає від 1 години з моменту підтвердження замовлення. Ми починаємо готувати страви (суші, піцу, бургери) тільки після підтвердження, щоб вони були максимально свіжими. У години пік час доставки може бути трохи збільшено.',
  },
  {
    q: 'Які умови безкоштовної доставки?',
    a: 'Ми надаємо безкоштовну доставку в радіусі до 1 км від нашого закладу при замовленні від 1000 грн. В інших випадках доставка здійснюється за тарифом служби таксі.',
  },
  {
    q: 'Чи можна змінити або скасувати замовлення?',
    a: `Так, ви можете змінити або скасувати замовлення, якщо воно ще не передано на кухню для приготування. Будь ласка, зателефонуйте нам якомога швидше за номером ${contactPhone}.`,
  },
  {
    q: 'Чи безпечна онлайн оплата?',
    a: 'Так, ми використовуємо надійну платіжну систему LiqPay від ПриватБанку. Ваші дані надійно зашифровані та не передаються третім особам.',
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
          🚴 Доставка
        </p>
        <h1 className="section-title" style={{ marginBottom: 16 }}>
          Доставка та оплата
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
          Ми знаходимось за адресою <strong>{shortAddress}</strong>. Безкоштовна доставка діє в радіусі до 1 км при замовленні від 1000 грн. Мінімальна сума замовлення для доставки — 500 грн.
        </p>
      </section>

      <section style={{ padding: '0 20px 80px', maxWidth: 1100, margin: '0 auto' }}>

        {/* Delivery zones */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <MapPin size={22} style={{ color: 'var(--accent)' }} />
            Зони доставки
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {DELIVERY_ZONES.map((z) => (
              <div
                key={z.zone}
                style={{
                  padding: '24px 24px',
                  borderRadius: 'var(--radius)',
                  background: z.bg,
                  border: `1px solid ${z.border}`,
                }}
              >
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>
                  {z.zone}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: z.color }}>
                  {z.price}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 16,
              padding: '14px 18px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(230,57,70,0.05)',
              border: '1px solid rgba(230,57,70,0.15)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              fontSize: 14,
              color: 'var(--text-secondary)',
            }}
          >
            <AlertCircle size={16} style={{ color: 'var(--accent)', marginTop: 1, flexShrink: 0 }} />
            Мінімальна сума замовлення для доставки — <strong style={{ color: 'var(--text-primary)' }}>500 грн</strong>. Вартість доставки розраховується при оформленні замовлення.
          </div>
        </div>

        {/* Delivery time */}
        <div
          className="card"
          style={{
            padding: '32px',
            marginBottom: 48,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 32,
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 56 }}>⚡</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>
              Доставка від 1 години
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Ми готуємо страви тільки після підтвердження замовлення, щоб вони були максимально свіжими. Кур'єр доставить гаряче замовлення прямо до ваших дверей.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, whiteSpace: 'nowrap' }}>
            <Clock size={16} />
            Пн – Нд: 10:00 – 21:00
          </div>
        </div>

        {/* Payment methods */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <CreditCard size={22} style={{ color: 'var(--accent)' }} />
            Способи оплати
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {PAYMENT_METHODS.map((m) => (
              <div
                key={m.title}
                className="card"
                style={{ padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 32 }}>{m.icon}</span>
                  {m.badge && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px',
                      borderRadius: 100, background: m.badgeBg, color: m.badgeColor,
                      border: `1px solid ${m.badgeColor}40`,
                    }}>
                      {m.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{m.title}</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How to order */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={22} style={{ color: 'var(--accent)' }} />
            Як зробити замовлення
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { n: '1', text: 'Оберіть улюблені страви з нашого меню (суші, піца, бургери) та додайте їх до кошика' },
              { n: '2', text: 'Перейдіть до кошика, вкажіть контактні дані та точну адресу доставки по Києву' },
              { n: '3', text: 'Оплатіть замовлення безпечно онлайн за допомогою системи LiqPay' },
              { n: '4', text: 'Наш менеджер зв\'яжеться з вами для підтвердження, а кур\'єр доставить все гарячим та свіжим!' },
            ].map((step) => (
              <div
                key={step.n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--accent), #c1121f)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 15, color: 'white',
                }}>
                  {step.n}
                </div>
                <span style={{ fontSize: 15, color: 'var(--text-primary)' }}>{step.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>
            Часті запитання
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {FAQ.map((item, i) => (
              <details
                key={i}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                }}
              >
                <summary
                  style={{
                    padding: '16px 20px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    userSelect: 'none',
                  }}
                >
                  {item.q}
                  <span className="faq-icon" style={{ color: 'var(--accent)', fontSize: 24, lineHeight: 1, marginLeft: 12, flexShrink: 0 }}></span>
                </summary>
                <div style={{ padding: '0 20px 16px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
