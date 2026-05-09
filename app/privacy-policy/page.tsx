import Header from '@/components/Header';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Публічна оферта — Enot Sushi',
  description: 'Публічна оферта та умови обслуговування ресторану доставки Enot Sushi.',
  robots: { index: false, follow: false },
};

const SECTIONS = [
  {
    title: '1. Загальні положення',
    content: `Цей документ є офіційною публічною офертою ФОП «Enot Sushi» (далі — «Виконавець») і містить умови замовлення та доставки готових страв на адресу замовника.

Розміщення замовлення на сайті enotsushi.com.ua або за телефоном +380 95 797 29 43 означає повне та беззастережне прийняття (акцепт) умов цього договору Замовником.`,
  },
  {
    title: '2. Предмет договору',
    content: `Виконавець зобов'язується на умовах та в порядку, визначених цим Договором, прийняти та виконати замовлення Замовника — приготувати та доставити замовлені страви, а Замовник зобов'язується прийняти та оплатити замовлення.`,
  },
  {
    title: '3. Порядок замовлення',
    content: `3.1. Замовлення здійснюється через сайт або за телефоном.
3.2. Після оформлення замовлення менеджер підтверджує його протягом 10–15 хвилин.
3.3. Виконавець залишає за собою право відмовити у прийнятті замовлення без пояснення причин.
3.4. Мінімальна сума замовлення — 250 гривень.`,
  },
  {
    title: '4. Ціни та оплата',
    content: `4.1. Ціни на страви вказані в гривнях (UAH) і включають ПДВ.
4.2. Виконавець залишає за собою право змінювати ціни без попереднього повідомлення. Для підтвердженого замовлення ціна фіксується.
4.3. Оплата здійснюється онлайн (картка Visa/Mastercard, Apple Pay, Google Pay через Monobank) або готівкою кур'єру.`,
  },
  {
    title: '5. Доставка',
    content: `5.1. Зона доставки — місто Київ та прилеглі райони.
5.2. Доставка в радіусі 5 км від ресторану (вул. Едуарда Вільде, 10Б) — безкоштовна.
5.3. Доставка понад 5 км розраховується як 50% від середнього тарифу таксі за додаткові кілометри.
5.4. Орієнтовний час доставки — від 1 години. Виконавець не несе відповідальності за затримки, що виникли з незалежних від нього причин (ДТП, погодні умови, пробки тощо).
5.5. При отриманні замовлення Замовник зобов'язаний перевірити комплектність і якість страв у присутності кур'єра.`,
  },
  {
    title: '6. Повернення та відмова',
    content: `6.1. Замовник може скасувати замовлення до моменту передачі його в готовку. Після цього скасування не приймається.
6.2. У разі виявлення неякісної страви Замовник повинен повідомити про це одразу при отриманні або протягом 30 хвилин після доставки за телефоном +380 95 797 29 43.
6.3. Повернення коштів за онлайн-оплату здійснюється на картку Замовника протягом 3–5 банківських днів після підтвердження претензії.`,
  },
  {
    title: '7. Відповідальність сторін',
    content: `7.1. Виконавець несе відповідальність за якість приготованих страв та дотримання санітарних норм.
7.2. Виконавець не несе відповідальності за шкоду, заподіяну внаслідок неправильного зберігання або використання страв після доставки.
7.3. Замовник несе відповідальність за достовірність контактних даних та адреси доставки.`,
  },
  {
    title: '8. Захист персональних даних',
    content: `8.1. Персональні дані Замовника (ім'я, телефон, адреса) збираються виключно для обробки та доставки замовлень.
8.2. Виконавець не передає персональні дані третім особам без згоди Замовника, за винятком випадків, передбачених законодавством України.
8.3. Замовник надає згоду на обробку персональних даних, розміщуючи замовлення.`,
  },
  {
    title: '9. Вирішення спорів',
    content: `9.1. Усі спори вирішуються шляхом переговорів.
9.2. У разі неможливості досягнення згоди — у судовому порядку відповідно до законодавства України.`,
  },
  {
    title: '10. Контактна інформація',
    content: `Ресторан Enot Sushi
Адреса: вул. Едуарда Вільде, 10Б, Київ
Телефон: +380 95 797 29 43
Email: hello@enotsushi.com.ua
Сайт: enotsushi.com.ua`,
  },
];

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Header />

      {/* Hero */}
      <section
        style={{
          paddingTop: 'clamp(100px, 15vw, 140px)',
          paddingBottom: 'clamp(32px, 5vw, 56px)',
          paddingLeft: 20,
          paddingRight: 20,
          textAlign: 'center',
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(230,57,70,0.08) 0%, transparent 70%)',
        }}
      >
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          Юридична інформація
        </p>
        <h1 className="section-title" style={{ marginBottom: 12 }}>
          Публічна оферта
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Останнє оновлення: 01 травня 2026 р.
        </p>
      </section>

      {/* Content */}
      <section style={{ padding: '0 20px 80px', maxWidth: 760, margin: '0 auto' }}>
        <div
          style={{
            padding: '20px 24px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(230,57,70,0.05)',
            border: '1px solid rgba(230,57,70,0.2)',
            marginBottom: 40,
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}
        >
          📋 Цей документ є публічною офертою. Замовляючи страви на сайті або за телефоном, ви підтверджуєте, що ознайомилися з умовами та погоджуєтесь з ними.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: 12,
                  paddingBottom: 10,
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {section.title}
              </h2>
              <div
                style={{
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-line',
                }}
              >
                {section.content}
              </div>
            </div>
          ))}
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
