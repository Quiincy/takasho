import Header from '@/components/Header';
import { Metadata } from 'next';
import { CheckCircle, MapPin, CreditCard, Banknote, Clock, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Доставка та оплата — Enot Sushi | Безкоштовна доставка суші',
  description: 'Умови доставки Enot Sushi: безкоштовно в радіусі 5 км, онлайн оплата Monobank, готівка. Доставка від 1 години. Мінімальне замовлення 250 грн.',
};

const DELIVERY_ZONES = [
  { zone: 'До 5 км', price: 'Безкоштовно 🎉', color: '#48c774', bg: 'rgba(72,199,116,0.08)', border: 'rgba(72,199,116,0.25)' },
  { zone: 'Від 5 до 10 км', price: '50% тарифу таксі', color: 'var(--accent-gold)', bg: 'rgba(244,162,97,0.08)', border: 'rgba(244,162,97,0.25)' },
  { zone: 'Понад 10 км', price: 'Уточнюйте у менеджера', color: 'var(--text-secondary)', bg: 'var(--bg-card)', border: 'var(--border)' },
];

const PAYMENT_METHODS = [
  {
    icon: '💳',
    title: 'Monobank / Visa / Mastercard',
    desc: 'Онлайн оплата карткою, Apple Pay, Google Pay через захищену форму',
    badge: 'Рекомендовано',
    badgeColor: '#48c774',
    badgeBg: 'rgba(72,199,116,0.15)',
  },
  {
    icon: '💵',
    title: 'Готівка',
    desc: 'Оплата готівкою при отриманні замовлення кур\'єру',
    badge: null,
    badgeColor: '',
    badgeBg: '',
  },
];

const FAQ = [
  {
    q: 'Яке мінімальне замовлення?',
    a: 'Мінімальна сума замовлення для доставки — 250 грн.',
  },
  {
    q: 'Скільки часу займає доставка?',
    a: 'Зазвичай від 1 години з моменту підтвердження замовлення. У години пік може бути довше.',
  },
  {
    q: 'Як розраховується вартість доставки понад 5 км?',
    a: 'Беремо середній тариф таксі (~9 грн/км), множимо на кількість км понад 5 км і ділимо навпіл. Ви платите лише 50%.',
  },
  {
    q: 'Чи можна змінити або скасувати замовлення?',
    a: 'Так, якщо замовлення ще не передано в готовку. Зателефонуйте нам якомога швидше.',
  },
  {
    q: 'Чи привезете здачу?',
    a: 'Так, кур\'єр приїжджає зі здачею. Але просимо по можливості готувати точну суму або оплачувати онлайн.',
  },
];

export default function DeliveryPage() {
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
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto' }}>
          Безкоштовна доставка в радіусі 5 км, швидко і гаряче прямо до вашої двері
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
            Мінімальна сума замовлення для доставки — <strong style={{ color: 'var(--text-primary)' }}>250 грн</strong>. Вартість доставки понад 5 км розраховується автоматично при оформленні замовлення.
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
            Пн – Нд: 11:00 – 23:00
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
              { n: '1', text: 'Оберіть страви з меню та додайте до кошика' },
              { n: '2', text: 'Перейдіть до оформлення, вкажіть адресу доставки' },
              { n: '3', text: 'Оберіть спосіб оплати та підтвердіть замовлення' },
              { n: '4', text: 'Очікуйте — ми зателефонуємо для підтвердження та привеземо замовлення' },
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
                  <span style={{ color: 'var(--accent)', fontSize: 20, lineHeight: 1, marginLeft: 12, flexShrink: 0 }}>+</span>
                </summary>
                <div style={{ padding: '0 20px 16px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '40px 20px' }}>
        <div className="footer-inner" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between', alignItems: 'center' }}>
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
