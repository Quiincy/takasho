'use client';

import { useCart } from '@/lib/cart-context';
import { useCallback, useState, Suspense, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowLeft, CreditCard, ShoppingBag, Phone, Info, CheckCircle, MapPin } from 'lucide-react';
import Footer from '@/components/Footer';
import { useSiteSettings } from '@/lib/settings-context';

const DeliveryMap = dynamic(() => import('@/components/DeliveryMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: 260,
      background: 'var(--bg-secondary)',
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-muted)',
      fontSize: 14,
    }}>
      🗺️ Завантаження карти...
    </div>
  ),
});

function CartContent() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { contact_phone, contact_address } = useSiteSettings();
  const paymentSuccess = searchParams?.get('payment') === 'success';
  const paymentError = searchParams?.get('payment') === 'error';
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryInfo, setDeliveryInfo] = useState<{ km: number; cost: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showMonoInfo, setShowMonoInfo] = useState(false);
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0);

  // Load saved form data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('cart_name');
      const savedPhone = localStorage.getItem('cart_phone');
      const savedAddress = localStorage.getItem('cart_address');
      if (savedName) setName(savedName);
      if (savedPhone) setPhone(savedPhone);
      if (savedAddress) setAddress(savedAddress);
    }
  }, []);

  // Save form data to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart_name', name);
    }
  }, [name]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart_phone', phone);
    }
  }, [phone]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart_address', address);
    }
  }, [address]);


  const handleDistanceChange = useCallback((km: number, cost: number) => {
    setDeliveryInfo({ km, cost });
  }, []);

  const actualDeliveryCost = (deliveryInfo?.cost === -1) ? 0 : (deliveryInfo?.cost ?? 0);
  const finalTotal = totalPrice + (deliveryMethod === 'delivery' ? actualDeliveryCost : 0);
  const isReady = name.trim() && phone.trim() && (deliveryMethod === 'pickup' || (address.trim() && totalPrice >= 500)) && items.length > 0;

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
          delivery_address: deliveryMethod === 'pickup' ? 'Самовивіз' : address.trim(),
          comment: comment.trim() || null,
          items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, weight: i.weight })),
          total_price: totalPrice,
          delivery_cost: deliveryMethod === 'delivery' ? actualDeliveryCost : 0,
          distance_km: deliveryMethod === 'delivery' ? (deliveryInfo?.km ?? null) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Помилка');

      setOrderId(data.order?.id ?? null);
      setConfirmedTotal(finalTotal);
      clearCart();

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'purchase', {
          event_category: 'ecommerce',
          transaction_id: data.order?.id,
          value: finalTotal,
          currency: 'UAH',
        });
      }

      if (data.liqpayData && data.liqpaySignature) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://www.liqpay.ua/api/3/checkout';
        form.style.display = 'none';

        const dataInput = document.createElement('input');
        dataInput.name = 'data';
        dataInput.value = data.liqpayData;
        form.appendChild(dataInput);

        const sigInput = document.createElement('input');
        sigInput.name = 'signature';
        sigInput.value = data.liqpaySignature;
        form.appendChild(sigInput);

        document.body.appendChild(form);
        form.submit();
      } else {
        setShowMonoInfo(true);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Щось пішло не так. Спробуйте ще раз.');
    } finally {
      setSubmitting(false);
    }
  };

  // Empty cart state (only if not returning from payment result)
  if (items.length === 0 && !showMonoInfo && !paymentSuccess && !paymentError) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header />
        <div style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '140px 20px 60px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 80, marginBottom: 20, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }}>🛒</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>Кошик порожній</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.7, fontSize: 15 }}>
            Додайте страви з меню, щоб оформити замовлення
          </p>
          <button onClick={() => router.push('/#menu')} className="btn-primary" style={{ fontSize: 15, padding: '13px 28px', display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={16} />
            До меню
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  // Error state (payment failed)
  if (paymentError) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '120px 16px 60px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(230,57,70,0.08), rgba(20,20,20,0.5))',
            border: '1px solid rgba(230,57,70,0.3)',
            borderRadius: 20,
            padding: 'clamp(24px, 5vw, 40px)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, marginBottom: 6 }}>
              Оплата не пройшла
            </h2>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 20,
              textAlign: 'center',
              marginBottom: 20,
              lineHeight: 1.8,
            }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Під час оплати сталася помилка, або ви скасували платіж.
                Ваше замовлення збережено в системі, але не оплачено.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={`tel:${contact_phone.replace(/[^0-9+]/g, '')}`}>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 24px', fontSize: 15 }}>
                  <Phone size={16} />
                  Зв'язатись з нами
                </button>
              </a>
              <Link href="/#menu">
                <button className="btn-ghost" style={{ padding: '13px 24px', fontSize: 15 }}>
                  До меню
                </button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Success state
  if (showMonoInfo || paymentSuccess) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '120px 16px 60px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(230,57,70,0.08), rgba(244,162,97,0.08))',
            border: '1px solid rgba(230,57,70,0.2)',
            borderRadius: 20,
            padding: 'clamp(24px, 5vw, 40px)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, marginBottom: 6 }}>
              Замовлення {paymentSuccess ? 'оплачено!' : 'прийнято!'}
            </h2>
            {orderId && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                №&nbsp;<code style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 6 }}>
                  {orderId.slice(0, 8).toUpperCase()}
                </code>
              </div>
            )}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 20,
              textAlign: 'left',
              marginBottom: 20,
              lineHeight: 1.8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, marginBottom: 10, color: '#48c774' }}>
                <CheckCircle size={18} />
                Замовлення успішно збережено та {paymentSuccess ? 'сплачено' : 'очікує обробки'}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 10 }}>
                Дякуємо за ваше замовлення! Ми вже почали його готувати. Очікуйте на доставку найближчим часом.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={`tel:${contact_phone.replace(/[^0-9+]/g, '')}`}>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 24px', fontSize: 15 }}>
                  <Phone size={16} />
                  Зателефонувати
                </button>
              </a>
              <Link href="/#menu">
                <button className="btn-ghost" style={{ padding: '13px 24px', fontSize: 15 }}>
                  До меню
                </button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Header />
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: 'clamp(100px, 15vw, 130px) 16px 60px',
      }}>
        {/* Back */}
        <button onClick={() => {
          const targetUrl = items.length > 0 
            ? `/?category=${items[items.length - 1].category_id}#menu` 
            : '/#menu';
          router.push(targetUrl);
        }} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--text-muted)', textDecoration: 'none',
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
          fontSize: 14, marginBottom: 24, transition: 'color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ArrowLeft size={16} />
          Повернутись до меню
        </button>

        <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, marginBottom: 32, letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          <span style={{ color: 'var(--accent)' }}>🛒</span> Ваше замовлення
        </h1>

        {/* Layout */}
        <div className="cart-layout" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
          gap: 20,
          alignItems: 'start',
        }}>

          {/* LEFT col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Cart items */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.4) 0%, rgba(20, 20, 20, 0.7) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 24,
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingBag size={16} style={{ color: 'var(--accent)' }} />
                  Страви ({items.length})
                </h2>
                <button
                  onClick={clearCart}
                  style={{
                    fontSize: 12, color: 'var(--text-muted)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 8px',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <Trash2 size={13} />
                  Очистити
                </button>
              </div>

              {items.map((item, idx) => (
                <div key={item.id} className="cart-item-row" style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  padding: '14px 16px',
                  borderBottom: idx < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  alignItems: 'center',
                }}>
                  {/* Image */}
                  <div style={{ position: 'relative', width: 60, height: 60, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                    <Image src={item.image} alt={item.name} fill sizes="60px" style={{ objectFit: 'cover' }} />
                  </div>

                  {/* Name + weight */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.weight}</div>
                  </div>

                  {/* Controls — on mobile they wrap below */}
                  <div className="cart-item-controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 15 }}>
                      {item.price * item.quantity} ₴
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{
                          width: 32, height: 32, borderRadius: 10,
                          border: '1px solid rgba(255,255,255,0.08)',
                          background: 'rgba(255,255,255,0.03)',
                          backdropFilter: 'blur(10px)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ fontWeight: 700, minWidth: 22, textAlign: 'center', fontSize: 15 }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{
                          width: 32, height: 32, borderRadius: 10,
                          border: '1px solid rgba(255,255,255,0.08)',
                          background: 'rgba(255,255,255,0.03)',
                          backdropFilter: 'blur(10px)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Plus size={13} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{
                          width: 32, height: 32, borderRadius: 10,
                          border: '1px solid rgba(230,57,70,0.2)',
                          background: 'rgba(230,57,70,0.06)',
                          color: 'var(--accent)',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery form */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.4) 0%, rgba(20, 20, 20, 0.7) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 24,
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              padding: 20,
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📦 Деталі замовлення</h2>
              
              <div style={{
                display: 'flex', gap: 6, marginBottom: 18,
                background: 'rgba(0,0,0,0.3)', padding: 6, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('delivery')}
                  style={{
                    flex: 1, padding: '10px', fontSize: 14, fontWeight: 600,
                    borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: deliveryMethod === 'delivery' ? 'var(--accent)' : 'transparent',
                    color: deliveryMethod === 'delivery' ? 'white' : 'var(--text-muted)',
                    boxShadow: deliveryMethod === 'delivery' ? '0 4px 15px rgba(230,57,70,0.4)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  🚚 Доставка
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  style={{
                    flex: 1, padding: '10px', fontSize: 14, fontWeight: 600,
                    borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: deliveryMethod === 'pickup' ? 'var(--accent)' : 'transparent',
                    color: deliveryMethod === 'pickup' ? 'white' : 'var(--text-muted)',
                    boxShadow: deliveryMethod === 'pickup' ? '0 4px 15px rgba(230,57,70,0.4)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  🏃 Самовивіз
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { id: 'delivery-name', label: "Ваше ім'я *", value: name, setter: setName, placeholder: 'Олексій', type: 'text' },
                  { id: 'delivery-phone', label: 'Телефон *', value: phone, setter: setPhone, placeholder: '+380 XX XXX XX XX', type: 'tel' },
                  ...(deliveryMethod === 'delivery' ? [{ id: 'delivery-address', label: 'Вулиця та будинок *', value: address, setter: setAddress, placeholder: 'вул. Героїв Дніпра, 12', type: 'text' }] : []),
                  { id: 'delivery-comment', label: 'Коментар (необов&apos;язково)', value: comment, setter: setComment, placeholder: 'Квартира, домофон...', type: 'text' },
                ].map(field => (
                  <div key={field.id}>
                    <label
                      htmlFor={field.id}
                      style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 5, display: 'block', fontWeight: 500 }}
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
                        padding: '12px 14px',
                        background: 'rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 14,
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                        color: 'var(--text-primary)',
                        fontSize: 16,
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box',
                      }}
                      onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT col: Map + Summary */}
          <div className="cart-sticky" style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 100 }}>

            {/* Map (only for delivery) */}
            {deliveryMethod === 'delivery' ? (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: 16,
              }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>🗺️ Зона доставки</h2>
                <DeliveryMap onDistanceChange={handleDistanceChange} address={address} />
              </div>
            ) : (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: 16,
              }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>📍 Де забирати?</h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {contact_address}
                </p>
                <div style={{ height: 120, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  🏪
                </div>
              </div>
            )}

            {/* Order summary */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.4) 0%, rgba(20, 20, 20, 0.7) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: 24,
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              padding: 20,
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>💰 Підсумок</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 14 }}>
                  <span>Страви ({items.reduce((s, i) => s + i.quantity, 0)} шт)</span>
                  <span>{totalPrice} ₴</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 14 }}>
                  <span>Доставка</span>
                  <span style={{ color: deliveryMethod === 'pickup' || deliveryInfo?.cost === 0 ? '#48c774' : (deliveryInfo?.cost === -1 ? 'var(--accent-gold)' : 'var(--text-primary)'), fontWeight: 600, fontSize: deliveryInfo?.cost === -1 ? 13 : 14 }}>
                    {deliveryMethod === 'pickup' ? 'САМОВИВІЗ' : (deliveryInfo === null ? '—' : deliveryInfo.cost === 0 ? 'БЕЗКОШТОВНО' : deliveryInfo.cost === -1 ? 'За тарифом таксі' : `${deliveryInfo.cost} ₴`)}
                  </span>
                </div>
                <div style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>Разом</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent)' }}>{finalTotal} ₴</span>
                </div>
              </div>

              <button
                id="checkout-btn"
                onClick={handleOrder}
                disabled={!isReady || submitting}
                className="btn-primary"
                style={{
                  width: '100%',
                  marginTop: 16,
                  fontSize: 15,
                  padding: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  borderRadius: 12,
                  opacity: (isReady && !submitting) ? 1 : 0.5,
                  cursor: (isReady && !submitting) ? 'pointer' : 'not-allowed',
                }}
              >
                <CreditCard size={17} />
                {submitting ? '⏳ Відправляємо...' : 'Оформити замовлення'}
              </button>

              {submitError && (
                <div style={{ fontSize: 13, color: 'var(--accent)', textAlign: 'center', marginTop: 10, padding: '10px', background: 'rgba(230,57,70,0.08)', borderRadius: 8 }}>
                  ❌ {submitError}
                </div>
              )}

              {!isReady && !submitError && (
                <p style={{ fontSize: 12, color: 'var(--accent)', textAlign: 'center', marginTop: 8 }}>
                  {deliveryMethod === 'delivery' && totalPrice < 500 
                    ? 'Мінімальна сума для доставки — 500 грн'
                    : <span style={{color: 'var(--text-muted)'}}>Заповніть ім&apos;я, телефон та адресу</span>}
                </p>
              )}

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 6, marginTop: 12, fontSize: 12, color: 'var(--text-muted)',
              }}>
                🔒 Безпечна оплата через LiqPay
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px 20px', textAlign: 'center' }}>Завантаження кошика...</div>}>
      <CartContent />
    </Suspense>
  );
}
