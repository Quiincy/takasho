'use client';

import { useCart } from '@/lib/cart-context';
import { useCallback, useState, Suspense, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowLeft, CreditCard, ShoppingBag, Phone, Info, CheckCircle, MapPin, Clock } from 'lucide-react';
import Footer from '@/components/Footer';
import { useSiteSettings } from '@/lib/settings-context';
import { IMaskInput } from 'react-imask';
import DatePicker, { registerLocale } from 'react-datepicker';
import { uk } from 'date-fns/locale/uk';
import { setHours, setMinutes, format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";

// Register Ukrainian locale for the calendar
registerLocale('uk', uk);

const parseTime = (timeStr: string, fallback: string = '10:00') => {
  const [h, m] = (timeStr || fallback).split(':').map(Number);
  return setHours(setMinutes(new Date(), m || 0), h || 0);
};

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
  const { contact_phone, contact_address, work_time_start, work_time_end } = useSiteSettings();
  const paymentSuccess = searchParams?.get('payment') === 'success';
  const paymentError = searchParams?.get('payment') === 'error';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  
  // Detailed address
  const [addressStreet, setAddressStreet] = useState('');
  const [addressBuilding, setAddressBuilding] = useState('');
  const [addressApt, setAddressApt] = useState('');
  const [addressFloor, setAddressFloor] = useState('');
  const [addressEntrance, setAddressEntrance] = useState('');
  const [addressIntercom, setAddressIntercom] = useState('');
  const [address, setAddress] = useState(''); // Combined address for map
  
  // Delivery time
  const [deliveryTime, setDeliveryTime] = useState<'asap' | 'specific'>('asap');
  const [specificTime, setSpecificTime] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'liqpay'>('liqpay');

  // Other
  const [comment, setComment] = useState('');
  const [persons, setPersons] = useState(1);

  const [deliveryInfo, setDeliveryInfo] = useState<{ km: number; cost: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showSuccessInfo, setShowSuccessInfo] = useState(false);
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0);

  const [isClosed, setIsClosed] = useState(false);
  const [nextAvailableTime, setNextAvailableTime] = useState('');

  // Check working hours
  useEffect(() => {
    const now = new Date();
    const kyivTimeStr = now.toLocaleString("en-US", {timeZone: "Europe/Kyiv", hour12: false, hour: '2-digit', minute: '2-digit'});
    
    const startStr = work_time_start || '10:00';
    const endStr = work_time_end || '21:00';
    
    if (kyivTimeStr < startStr || kyivTimeStr >= endStr) {
      setIsClosed(true);
      setDeliveryTime('specific');
      
      const [sh, sm] = startStr.split(':').map(Number);
      const nextH = (sh + 1).toString().padStart(2, '0');
      const nextM = sm.toString().padStart(2, '0');
      const nextTime = `${nextH}:${nextM}`;
      
      setNextAvailableTime(nextTime);
      setSpecificTime(prev => prev || nextTime);
    } else {
      setIsClosed(false);

      const [ch, cm] = kyivTimeStr.split(':').map(Number);
      const nextH = (ch + 1).toString().padStart(2, '0');
      const nextM = cm.toString().padStart(2, '0');
      let minTodayTime = `${nextH}:${nextM}`;
      
      if (minTodayTime > endStr) {
        minTodayTime = endStr;
      }
      setNextAvailableTime(minTodayTime);
    }
  }, [work_time_start, work_time_end]);

  // Load saved form data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setName(localStorage.getItem('cart_name') || '');
      setPhone(localStorage.getItem('cart_phone') || '');
      setAddressStreet(localStorage.getItem('cart_street') || '');
      setAddressBuilding(localStorage.getItem('cart_bld') || '');
      setAddressApt(localStorage.getItem('cart_apt') || '');
      setAddressEntrance(localStorage.getItem('cart_ent') || '');
      setAddressFloor(localStorage.getItem('cart_flr') || '');
      setAddressIntercom(localStorage.getItem('cart_int') || '');
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart_name', name);
      localStorage.setItem('cart_phone', phone);
      localStorage.setItem('cart_street', addressStreet);
      localStorage.setItem('cart_bld', addressBuilding);
      localStorage.setItem('cart_apt', addressApt);
      localStorage.setItem('cart_ent', addressEntrance);
      localStorage.setItem('cart_flr', addressFloor);
      localStorage.setItem('cart_int', addressIntercom);
    }
  }, [name, phone, addressStreet, addressBuilding, addressApt, addressEntrance, addressFloor, addressIntercom]);

  // Update map address automatically when street or building changes
  useEffect(() => {
    setAddress(`${addressStreet} ${addressBuilding}`.trim());
  }, [addressStreet, addressBuilding]);

  const handleDistanceChange = useCallback((km: number, cost: number) => {
    setDeliveryInfo({ km, cost });
  }, []);

  const actualDeliveryCost = (deliveryInfo?.cost === -1) ? 0 : (deliveryInfo?.cost ?? 0);
  const finalTotal = totalPrice + (deliveryMethod === 'delivery' ? actualDeliveryCost : 0);
  
  const isAddressValid = addressStreet.trim() && addressBuilding.trim();
  const isReady = name.trim() && phone.trim() && (deliveryMethod === 'pickup' || (isAddressValid && totalPrice >= 500)) && items.length > 0;

  const handleOrder = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 12) {
        throw new Error('Номер телефону введено не повністю. Будь ласка, перевірте правильність.');
      }

      const cleanedPhone = phone.replace(/[-()\s]/g, '');
      const phoneRegex = /^(?:\+?38)?0(39|50|63|66|67|68|73|89|91|92|93|94|95|96|97|98|99)\d{7}$/;
      if (!phoneRegex.test(cleanedPhone)) {
        throw new Error('Будь ласка, введіть коректний український номер мобільного телефону (наприклад, 050 123 4567)');
      }

      if (deliveryTime === 'specific') {
        const endStr = work_time_end || '21:00';
        if (!specificTime || specificTime < nextAvailableTime || specificTime > endStr) {
          throw new Error(`Будь ласка, оберіть дійсний час між ${nextAvailableTime} та ${endStr}`);
        }
      }

      let finalDeliveryAddress = 'Самовивіз';
      if (deliveryMethod === 'delivery') {
        const parts = [
          `вул. ${addressStreet}`,
          `буд. ${addressBuilding}`,
          addressApt && `кв. ${addressApt}`,
          addressFloor && `пов. ${addressFloor}`,
          addressEntrance && `під. ${addressEntrance}`,
          addressIntercom && `дом. ${addressIntercom}`
        ].filter(Boolean);
        finalDeliveryAddress = parts.join(', ');
      }

      const finalComment = `
Тип доставки: ${deliveryMethod === 'pickup' ? 'Самовивіз' : "Доставка кур'єром"}
Час: ${isClosed ? `На завтра: ${specificTime}` : (deliveryTime === 'asap' ? 'Якомога швидше' : `На ${specificTime}`)}
Оплата: Онлайн оплата LiqPay
Персон: ${persons}
Коментар клієнта: ${comment || '-'}
      `.trim();

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          delivery_address: finalDeliveryAddress,
          comment: finalComment,
          items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, weight: i.weight })),
          total_price: totalPrice,
          delivery_cost: deliveryMethod === 'delivery' ? actualDeliveryCost : 0,
          distance_km: deliveryMethod === 'delivery' ? (deliveryInfo?.km ?? null) : null,
          payment_method: paymentMethod,
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

      if (data.liqpay) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://www.liqpay.ua/api/3/checkout';
        form.style.display = 'none';

        const dataInput = document.createElement('input');
        dataInput.type = 'hidden';
        dataInput.name = 'data';
        dataInput.value = data.liqpay.data;

        const signatureInput = document.createElement('input');
        signatureInput.type = 'hidden';
        signatureInput.name = 'signature';
        signatureInput.value = data.liqpay.signature;

        form.appendChild(dataInput);
        form.appendChild(signatureInput);
        document.body.appendChild(form);
        form.submit();
        return;
      }

      setShowSuccessInfo(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Щось пішло не так. Спробуйте ще раз.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !showSuccessInfo) {
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

  if (showSuccessInfo) {
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
              Замовлення прийнято!
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
                Замовлення успішно збережено та очікує обробки
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
      <style jsx global>{`
        .react-datepicker-wrapper { display: inline-block; }
        .react-datepicker {
          font-family: inherit;
          background-color: var(--bg-card);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        .react-datepicker__header {
          background-color: var(--bg-secondary);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px 16px 0 0;
          padding: 12px 0;
          color: white !important;
        }
        .react-datepicker-time__header {
          color: white !important;
          font-weight: 600;
        }
        .react-datepicker__header--time {
          color: white !important;
        }
        .react-datepicker__time-container {
          border-left: 1px solid rgba(255,255,255,0.05) !important;
        }
        .react-datepicker__time {
          background-color: var(--bg-card) !important;
          color: var(--text-primary) !important;
        }
        .react-datepicker__time-list-item {
          color: white !important;
          background-color: var(--bg-card) !important;
        }
        .react-datepicker__time-list-item:hover {
          background-color: rgba(230, 57, 70, 0.2) !important;
          color: var(--accent) !important;
        }
        .react-datepicker__time-list-item--selected {
          background-color: var(--accent) !important;
          color: white !important;
        }
        .react-datepicker__time-list-item--disabled {
          display: none !important;
        }
      `}</style>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: 'clamp(100px, 15vw, 130px) 16px 60px',
      }}>
        <button onClick={() => {
          let targetUrl = '/#menu';
          const lastCategory = localStorage.getItem('lastMenuCategory');
          const lastSubCategory = localStorage.getItem('lastMenuSubCategory');
          
          if (lastCategory && lastCategory !== 'all') {
            targetUrl = `/?category=${lastCategory}`;
            if (lastSubCategory && lastSubCategory !== 'all') {
              targetUrl += `&subCategory=${lastSubCategory}`;
            }
            targetUrl += '#menu';
          } else if (items.length > 0) {
            const lastItem = items[items.length - 1];
            targetUrl = `/?category=${lastItem.category_id}#menu`;
          }
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

        <div className="cart-layout" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
          gap: 20,
          alignItems: 'start',
        }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                    display: 'flex', alignItems: 'center', gap: 4, padding: '12px 16px',
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
                  <div style={{ position: 'relative', width: 60, height: 60, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                    <Image src={item.image} alt={item.name} fill sizes="60px" style={{ objectFit: 'cover' }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.weight}</div>
                  </div>

                  <div className="cart-item-controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 15 }}>
                      {item.price * item.quantity} ₴
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{
                          width: 44, height: 44, borderRadius: 12,
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
                          width: 44, height: 44, borderRadius: 12,
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
                          width: 44, height: 44, borderRadius: 12,
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Робимо замовлення</h2>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('delivery')}
                    style={{
                      flex: 1, padding: '20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)',
                      textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', minWidth: 200,
                      background: deliveryMethod === 'delivery' ? 'var(--accent)' : 'rgba(0,0,0,0.25)',
                      color: deliveryMethod === 'delivery' ? 'white' : 'var(--text-primary)',
                      boxShadow: deliveryMethod === 'delivery' ? '0 4px 15px rgba(230,57,70,0.4)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Доставка кур'єром</div>
                    <div style={{ fontSize: 13, opacity: deliveryMethod === 'delivery' ? 0.9 : 0.5 }}>Замовлення прибуде на вибрану адресу</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('pickup')}
                    style={{
                      flex: 1, padding: '20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)',
                      textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', minWidth: 200,
                      background: deliveryMethod === 'pickup' ? 'var(--accent)' : 'rgba(0,0,0,0.25)',
                      color: deliveryMethod === 'pickup' ? 'white' : 'var(--text-primary)',
                      boxShadow: deliveryMethod === 'pickup' ? '0 4px 15px rgba(230,57,70,0.4)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Самовивіз</div>
                    <div style={{ fontSize: 13, opacity: deliveryMethod === 'pickup' ? 0.9 : 0.5 }}>Забрати із ресторану</div>
                  </button>
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Дані одержувача</h2>
                <div className="checkout-grid-2">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ваше ім'я *"
                    style={{
                      width: '100%', padding: '16px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)',
                      borderRadius: 14, color: 'white', fontSize: 15, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
                    }}
                  />
                  <IMaskInput
                    mask="+38\0 (00) 000 00 00"
                    lazy={false}
                    value={phone}
                    onAccept={(value) => setPhone(value)}
                    placeholder="+380 (__) ___ __ __"
                    inputMode="tel"
                    type="tel"
                    style={{
                      width: '100%', padding: '16px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)',
                      borderRadius: 14, color: 'white', fontSize: 15, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {deliveryMethod === 'delivery' && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>Адреса</h2>
                    <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>м. Київ</span>
                  </div>
                  <div className="checkout-grid-3" style={{ marginBottom: 12 }}>
                    <input type="text" value={addressStreet} onChange={e => setAddressStreet(e.target.value)} placeholder="Вулиця *" style={{ padding: '16px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', borderRadius: 14, color: 'white', fontSize: 15, outline: 'none' }} />
                    <input type="text" value={addressBuilding} onChange={e => setAddressBuilding(e.target.value)} placeholder="Будинок *" style={{ padding: '16px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', borderRadius: 14, color: 'white', fontSize: 15, outline: 'none' }} />
                    <input type="text" value={addressApt} onChange={e => setAddressApt(e.target.value)} placeholder="Квартира" style={{ padding: '16px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', borderRadius: 14, color: 'white', fontSize: 15, outline: 'none' }} />
                  </div>
                  <div className="checkout-grid-3-equal">
                    <input type="text" value={addressFloor} onChange={e => setAddressFloor(e.target.value)} placeholder="Поверх" style={{ padding: '16px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', borderRadius: 14, color: 'white', fontSize: 15, outline: 'none' }} />
                    <input type="text" value={addressEntrance} onChange={e => setAddressEntrance(e.target.value)} placeholder="Під'їзд" style={{ padding: '16px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', borderRadius: 14, color: 'white', fontSize: 15, outline: 'none' }} />
                    <input type="text" value={addressIntercom} onChange={e => setAddressIntercom(e.target.value)} placeholder="Домофон" style={{ padding: '16px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', borderRadius: 14, color: 'white', fontSize: 15, outline: 'none' }} />
                  </div>
                </div>
              )}

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Умови доставки</h2>
                
                {isClosed && (
                  <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(244, 162, 97, 0.1)', border: '1px solid rgba(244, 162, 97, 0.2)', borderRadius: 12, color: 'var(--accent-gold)', fontSize: 14, lineHeight: 1.5 }}>
                    ⚠️ <b>Ресторан наразі зачинено.</b> Ми працюємо з {work_time_start || '10:00'} до {work_time_end || '21:00'}. Ви можете оформити попереднє замовлення на завтра (найближчий час доставки — {nextAvailableTime}).
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {!isClosed && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>
                      <input type="radio" checked={deliveryTime === 'asap'} onChange={() => setDeliveryTime('asap')} style={{ accentColor: 'var(--accent)', width: 20, height: 20 }} />
                      Якомога швидше
                    </label>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: isClosed ? 'default' : 'pointer', fontSize: 16, color: deliveryTime === 'specific' ? 'white' : 'var(--text-muted)' }}>
                      <input type="radio" checked={deliveryTime === 'specific'} onChange={() => !isClosed && setDeliveryTime('specific')} style={{ accentColor: 'var(--accent)', width: 20, height: 20 }} />
                      {isClosed ? `Завтра о:` : `До певного часу`}
                    </label>
                    {deliveryTime === 'specific' && (
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Clock size={16} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', zIndex: 2, pointerEvents: 'none' }} />
                        <DatePicker
                          selected={specificTime ? parseTime(specificTime) : null}
                          onChange={(date: Date | null) => {
                            if (date) setSpecificTime(format(date, 'HH:mm'));
                          }}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={5}
                          timeCaption="Час"
                          dateFormat="HH:mm"
                          timeFormat="HH:mm"
                          minTime={parseTime(nextAvailableTime || work_time_start)}
                          maxTime={parseTime(work_time_end || '21:00')}
                          locale="uk"
                          placeholderText="00:00"
                          customInput={
                            <input style={{ padding: '10px 12px 10px 36px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', borderRadius: 8, color: 'white', fontSize: 15, outline: 'none', cursor: 'pointer', width: 90 }} />
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Умови платежу</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'default', fontSize: 16, color: 'white' }}>
                    <input type="radio" checked readOnly style={{ accentColor: 'var(--accent)', width: 20, height: 20 }} />
                    Онлайн оплата LiqPay
                  </label>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: -8 }}>
                    Оплата замовлення здійснюється тільки онлайн через безпечну систему LiqPay.
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Крім того</h2>
                <input type="text" value={comment} onChange={e => setComment(e.target.value)} placeholder="Коментар (необов'язково)" style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', borderRadius: 14, color: 'white', fontSize: 15, outline: 'none', marginBottom: 20, boxSizing: 'border-box' }} />
                
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Кількість персон</h3>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', borderRadius: 14, padding: '6px 12px' }}>
                  <button type="button" onClick={() => setPersons(Math.max(1, persons - 1))} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Minus size={16} />
                  </button>
                  <span style={{ fontSize: 18, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{persons}</span>
                  <button type="button" onClick={() => setPersons(persons + 1)} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Plus size={16} />
                  </button>
                </div>
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
                <DeliveryMap onDistanceChange={handleDistanceChange} address={address} cartTotal={totalPrice} />
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
                  <span style={{ color: deliveryMethod === 'pickup' || deliveryInfo?.cost === 0 ? '#48c774' : 'var(--text-primary)', fontWeight: 600, fontSize: 14 }}>
                    {deliveryMethod === 'pickup' ? 'САМОВИВІЗ' : (deliveryInfo === null ? '—' : `${deliveryInfo.cost} ₴`)}
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
                    ? 'Мінімальна сума замовлення — 500 грн (без урахування доставки)'
                    : <span style={{color: 'var(--text-muted)'}}>Заповніть ім'я, телефон та адресу</span>}
                </p>
              )}
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
