'use client';

import { useCart } from '@/lib/cart-context';
import { useCallback, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import dynamic from 'next/dynamic';
import { Trash2, Plus, Minus, ArrowLeft, CreditCard, ShoppingBag, Phone, Info, CheckCircle } from 'lucide-react';

const DeliveryMap = dynamic(() => import('@/components/DeliveryMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: 320,
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-muted)',
    }}>
      🗺️ Завантаження карти...
    </div>
  ),
});

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState<{ km: number; cost: number } | null>(null);
  const [showMonoInfo, setShowMonoInfo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleDistanceChange = useCallback((km: number, cost: number) => {
    setDeliveryInfo({ km, cost });
  }, []);

  const finalTotal = totalPrice + (deliveryInfo?.cost ?? 0);
  const isReady = name.trim() && phone.trim() && address.trim() && items.length > 0;

  const handleOrder = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          delivery_address: address.trim(),
          comment: comment.trim() || null,
          items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, weight: i.weight })),
          total_price: totalPrice,
          delivery_cost: deliveryInfo?.cost ?? 0,
          distance_km: deliveryInfo?.km ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Помилка');

      setOrderId(data.order?.id ?? null);
      clearCart();

      // Google Ads purchase conversion
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'purchase', {
          event_category: 'ecommerce',
          transaction_id: data.order?.id,
          value: finalTotal,
          currency: 'UAH',
        });
      }
      setShowMonoInfo(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Щось пішло не так. Спробуйте ще раз.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !showMonoInfo) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header />
        <div style={{
          maxWidth: 600,
          margin: '0 auto',
          padding: '160px 20px 80px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 80, marginBottom: 24 }}>🛒</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Кошик порожній</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.7 }}>
            Додайте страви з меню, щоб оформити замовлення
          </p>
          <Link href="/#menu">
            <button className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
              ← Повернутись до меню
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Header />
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '120px 20px 80px',
      }}>
        {/* Back link */}
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          color: 'var(--text-muted)',
          textDecoration: 'none',
          fontSize: 14,
          marginBottom: 32,
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ArrowLeft size={16} />
          Повернутись до меню
        </Link>

        <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, marginBottom: 32, letterSpacing: '-0.02em' }}>
          🛒 Ваше замовлення
        </h1>

        {showMonoInfo ? (
          // Monobank Instruction Panel
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(230,57,70,0.1), rgba(244,162,97,0.1))',
              border: '1px solid rgba(230,57,70,0.25)',
              borderRadius: 'var(--radius)',
              padding: 40,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
              <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
                Замовлення прийнято!
              </h2>
              {orderId && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                  № <code style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{orderId.slice(0, 8).toUpperCase()}</code>
                </div>
              )}
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: 24,
                textAlign: 'left',
                marginBottom: 24,
                lineHeight: 1.9,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 16, marginBottom: 12, color: '#48c774' }}>
                  <CheckCircle size={20} />
                  Замовлення збережено в системі
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  Для завершення оплати зателефонуйте нам або надішліть повідомлення:
                </p>
                <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent)', margin: '12px 0' }}>
                  <a href="tel:+380957972943" style={{ color: 'inherit', textDecoration: 'none' }}>
                    +380 95 797 29 43
                  </a>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 4 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Сума до оплати:</strong>{' '}
                  {finalTotal} ₴
                  {deliveryInfo && deliveryInfo.cost > 0 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {' '}(включно {deliveryInfo.cost} ₴ доставка)
                    </span>
                  )}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Адреса:</strong> {address}
                </p>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
                <div style={{
                  background: 'rgba(230,57,70,0.08)',
                  border: '1px solid rgba(230,57,70,0.2)',
                  borderRadius: 8,
                  padding: 14,
                  display: 'flex',
                  gap: 10,
                }}>
                  <Info size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--accent)' }}>Як підключити онлайн оплату Monobank Acquiring:</strong><br />
                    Зареєструйтесь на <strong>api.monobank.ua</strong> → Отримайте API токен → Додайте його до <code style={{ background: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: 4 }}>.env.local</code> як <code>MONO_TOKEN</code> → Endpoint <code>/api/create-payment</code> вже готовий до використання.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="tel:+380957972943">
                  <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', fontSize: 15 }}>
                    <Phone size={16} />
                    Зателефонувати
                  </button>
                </a>
                <Link href="/">
                  <button className="btn-ghost" style={{ padding: '14px 28px', fontSize: 15 }}>
                    Повернутись
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="cart-layout"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
              gap: 28,
              alignItems: 'start',
            }}
          >
            {/* Left: Items + Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Cart Items */}
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShoppingBag size={18} style={{ color: 'var(--accent)' }} />
                    Страви ({items.length})
                  </h2>
                  <button
                    onClick={clearCart}
                    style={{
                      fontSize: 13,
                      color: 'var(--text-muted)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <Trash2 size={14} />
                    Очистити
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: 14,
                      padding: '16px 24px',
                      borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ position: 'relative', width: 70, height: 70, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                      <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.weight}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{
                            width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)',
                            background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{
                            width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)',
                            background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div style={{ fontWeight: 700, minWidth: 70, textAlign: 'right', color: 'var(--accent)', fontSize: 16 }}>
                        {item.price * item.quantity} ₴
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--text-muted)', display: 'flex', padding: 4,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Form */}
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 24,
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📦 Деталі доставки</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { id: 'delivery-name', label: "Ваше ім'я *", value: name, setter: setName, placeholder: "Олексій", type: 'text' },
                    { id: 'delivery-phone', label: 'Телефон *', value: phone, setter: setPhone, placeholder: '+380 XX XXX XX XX', type: 'tel' },
                    { id: 'delivery-address', label: 'Вулиця та будинок *', value: address, setter: setAddress, placeholder: 'вул. Героїв Дніпра, 12', type: 'text' },
                    { id: 'delivery-comment', label: 'Коментар (не обов&apos;язково)', value: comment, setter: setComment, placeholder: 'Квартира, домофон, побажання...', type: 'text' },
                  ].map(field => (
                    <div key={field.id}>
                      <label
                        htmlFor={field.id}
                        style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, display: 'block', fontWeight: 500 }}
                        dangerouslySetInnerHTML={{ __html: field.label }}
                      />
                      <input
                        id={field.id}
                        type={field.type}
                        value={field.value}
                        onChange={e => field.setter(e.target.value)}
                        placeholder={field.placeholder}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          color: 'var(--text-primary)',
                          fontSize: 15,
                          outline: 'none',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Map + Summary */}
            <div className="cart-sticky" style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 110 }}>
              {/* Map */}
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 20,
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                  🗺️ Зона доставки
                </h2>
                <DeliveryMap onDistanceChange={handleDistanceChange} address={address} />
              </div>

              {/* Order Summary */}
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 24,
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>💰 Підсумок</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 15 }}>
                    <span>Страви ({items.reduce((s, i) => s + i.quantity, 0)} шт)</span>
                    <span>{totalPrice} ₴</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 15 }}>
                    <span>Доставка</span>
                    <span style={{ color: deliveryInfo?.cost === 0 ? '#48c774' : 'var(--text-primary)', fontWeight: 600 }}>
                      {deliveryInfo === null ? '—' : deliveryInfo.cost === 0 ? 'БЕЗКОШТОВНО' : `${deliveryInfo.cost} ₴`}
                    </span>
                  </div>
                  {deliveryInfo === null && address.length > 3 && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Введіть вулицю та будинок для розрахунку доставки
                    </p>
                  )}
                  <div style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 17, fontWeight: 700 }}>Разом</span>
                    <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent)' }}>
                      {finalTotal} ₴
                    </span>
                  </div>
                </div>

                <button
                  id="checkout-btn"
                  onClick={handleOrder}
                  disabled={!isReady || submitting}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    marginTop: 20,
                    fontSize: 16,
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    opacity: (isReady && !submitting) ? 1 : 0.5,
                    cursor: (isReady && !submitting) ? 'pointer' : 'not-allowed',
                  }}
                >
                  <CreditCard size={18} />
                  {submitting ? '⏳ Відправляємо...' : 'Оплатити замовлення'}
                </button>

                {submitError && (
                  <div style={{ fontSize: 13, color: 'var(--accent)', textAlign: 'center', marginTop: 10, padding: '10px', background: 'rgba(230,57,70,0.08)', borderRadius: 8 }}>
                    ❌ {submitError}
                  </div>
                )}

                {!isReady && !submitError && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
                    Заповніть ім&apos;я, телефон та адресу
                  </p>
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 14,
                  fontSize: 12,
                  color: 'var(--text-muted)',
                }}>
                  🔒 Безпечна оплата через Monobank
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
