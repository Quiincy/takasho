'use client';

import { useCart } from '@/lib/cart-context';
import { DbMenuItem } from '@/lib/supabase';
import { ArrowLeft, Check, Minus, Plus, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function ProductView({ product }: { product: DbMenuItem }) {
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const [added, setAdded] = useState(false);
  
  const cartItem = items.find(i => i.id === product.id);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);

    // Google Ads conversion tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'add_to_cart', {
        event_category: 'ecommerce',
        event_label: product.name,
        value: product.price,
        currency: 'UAH',
      });
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '120px 20px 80px' }}>
      {/* Навігація назад */}
      <Link href="/#menu" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: 'var(--text-muted)',
        textDecoration: 'none',
        fontSize: 15,
        marginBottom: 32,
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
        <ArrowLeft size={18} />
        Повернутись до меню
      </Link>

      {/* Головний блок */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 40,
        alignItems: 'start',
      }}>
        {/* Зображення */}
        <div style={{
          position: 'relative',
          aspectRatio: '1/1',
          width: '100%',
          borderRadius: 32,
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        }}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: 'cover' }}
            priority
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Інформація */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.4) 0%, rgba(20, 20, 20, 0.7) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 32,
          padding: 'clamp(24px, 5vw, 40px)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(230,57,70,0.1)',
            border: '1px solid rgba(230,57,70,0.2)',
            color: 'var(--accent)',
            padding: '6px 14px',
            borderRadius: 100,
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 16,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {product.weight}
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 900,
            lineHeight: 1.1,
            color: 'var(--text-primary)',
            marginBottom: 16,
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            letterSpacing: '-0.02em',
          }}>
            {product.name}
          </h1>

          <div style={{
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: 900,
            color: 'white',
            marginBottom: 24,
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}>
            {product.price} <span style={{ color: 'var(--accent)', fontSize: '0.8em' }}>₴</span>
          </div>

          <p style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            marginBottom: 32,
          }}>
            {product.description || 'Детальний опис для цієї страви ще не додано, але вона точно дуже смачна!'}
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: 32 }} />

          {/* Кнопка або Контролер кількості */}
          {cartItem ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20,
              padding: '12px 24px',
            }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>У кошику:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                  onClick={() => removeItem(product.id)}
                  style={{
                    width: 40, height: 40, borderRadius: 12,
                    border: '1px solid rgba(230,57,70,0.2)',
                    background: 'rgba(230,57,70,0.1)',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(230,57,70,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(230,57,70,0.1)'}
                >
                  <Minus size={18} />
                </button>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'white', minWidth: 24, textAlign: 'center' }}>
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                  style={{
                    width: 40, height: 40, borderRadius: 12,
                    border: '1px solid rgba(72,199,116,0.3)',
                    background: 'rgba(72,199,116,0.1)',
                    color: '#48c774',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(72,199,116,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(72,199,116,0.1)'}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '20px',
                borderRadius: 20,
                border: added ? '1px solid rgba(72,199,116,0.3)' : 'none',
                background: added 
                  ? 'linear-gradient(135deg, rgba(72,199,116,0.2) 0%, rgba(72,199,116,0.1) 100%)' 
                  : 'linear-gradient(135deg, var(--accent) 0%, #c1121f 100%)',
                color: added ? '#48c774' : 'white',
                fontSize: 18,
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: added ? 'none' : '0 10px 25px rgba(230, 57, 70, 0.4)',
              }}
              onMouseEnter={e => {
                if (!added) e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                if (!added) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {added ? (
                <>
                  <Check size={22} strokeWidth={3} />
                  <span>Додано в кошик!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={22} />
                  <span>Додати до кошика</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
