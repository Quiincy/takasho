'use client';

import Image from 'next/image';
import { Plus, Check } from 'lucide-react';
import { MenuItem } from '@/lib/menu-data';
import { useCart } from '@/lib/cart-context';
import { useState } from 'react';

interface Props {
  item: MenuItem;
  index?: number;
}

const badgeConfig = {
  hit: { label: '🔥 Хіт', className: 'badge-hit' },
  new: { label: '✨ Нове', className: 'badge-new' },
  special: { label: '⭐ Шеф', className: 'badge-special' },
};

export default function MenuCard({ item, index = 0 }: Props) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const cartItem = items.find(i => i.id === item.id);

  const handleAdd = () => {
    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
    // Google Ads conversion tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'add_to_cart', {
        event_category: 'ecommerce',
        event_label: item.name,
        value: item.price,
        currency: 'UAH',
      });
    }
  };

  return (
    <article
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeInUp 0.4s ease forwards',
        animationDelay: `${index * 0.05}s`,
        opacity: 0,
      }}
      itemScope
      itemType="https://schema.org/MenuItem"
    >
      {/* Image */}
      <div className="menu-card-image" style={{
        position: 'relative',
        height: 200,
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <Image
          src={item.image}
          alt={`${item.name} — замовити з доставкою в Києві`}
          fill
          style={{
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onMouseEnter={e => {
            const img = e.currentTarget as HTMLElement;
            img.style.transform = 'scale(1.06)';
          }}
          onMouseLeave={e => {
            const img = e.currentTarget as HTMLElement;
            img.style.transform = 'scale(1)';
          }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'linear-gradient(to top, rgba(26,26,26,0.9) 0%, transparent 100%)',
        }} />

        {/* Badge */}
        {item.badge && (
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <span className={`badge ${badgeConfig[item.badge].className}`}>
              {badgeConfig[item.badge].label}
            </span>
          </div>
        )}

        {/* Cart quantity indicator */}
        {cartItem && (
          <div style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'var(--accent)',
            color: 'white',
            borderRadius: 100,
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
          }}>
            {cartItem.quantity}
          </div>
        )}

        {/* Price on image */}
        <div style={{
          position: 'absolute',
          bottom: 10,
          right: 12,
          fontSize: 20,
          fontWeight: 800,
          color: 'white',
        }}>
          <span itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <span itemProp="price">{item.price}</span>{' '}
            <span itemProp="priceCurrency" content="UAH">₴</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="menu-card-content" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <h3
            itemProp="name"
            className="menu-card-title"
            style={{
              fontSize: 16,
              fontWeight: 700,
              lineHeight: 1.3,
              color: 'var(--text-primary)',
            }}
          >
            {item.name}
          </h3>
          <span style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
            fontWeight: 500,
            flexShrink: 0,
          }}>
            {item.weight}
          </span>
        </div>

        <p
          itemProp="description"
          style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.description}
        </p>

        {/* Add button */}
        <button
          id={`add-${item.id}`}
          className="menu-card-add-btn"
          onClick={handleAdd}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '11px',
            borderRadius: 10,
            border: '1px solid',
            borderColor: added ? '#48c774' : 'var(--border-accent)',
            background: added
              ? 'rgba(72,199,116,0.1)'
              : 'rgba(230,57,70,0.08)',
            color: added ? '#48c774' : 'var(--accent)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginTop: 4,
          }}
          onMouseEnter={e => {
            if (!added) {
              e.currentTarget.style.background = 'rgba(230,57,70,0.18)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={e => {
            if (!added) {
              e.currentTarget.style.background = 'rgba(230,57,70,0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {added ? (
            <>
              <Check size={16} />
              Додано!
            </>
          ) : (
            <>
              <Plus size={16} />
              Додати до кошика
            </>
          )}
        </button>
      </div>
    </article>
  );
}
