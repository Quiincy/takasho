'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus, Check, ShoppingCart } from 'lucide-react';
import { DbMenuItem } from '@/lib/supabase';
import { useCart } from '@/lib/cart-context';
import { useState } from 'react';

interface Props {
  item: DbMenuItem;
  index?: number;
}

export default function MenuCard({ item, index = 0 }: Props) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const isSauce = item.id === 'crisps-8';
  const sauceOptions = isSauce ? item.description?.split('\n').map(s => s.trim()).filter(Boolean) || [] : [];
  const [selectedSauce, setSelectedSauce] = useState(sauceOptions[0] || '');

  const totalQuantity = isSauce 
    ? items.filter(i => i.id.startsWith(item.id)).reduce((sum, i) => sum + i.quantity, 0)
    : items.find(i => i.id === item.id)?.quantity || 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const itemToAdd = isSauce && selectedSauce ? {
      ...item,
      id: `${item.id}-${selectedSauce}`,
      name: `${item.name} (${selectedSauce})`
    } : item;

    addItem(itemToAdd);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);

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
    <Link href={`/product/${item.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <article
      className="premium-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.7) 0%, rgba(20, 20, 20, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: isHovered
          ? '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(230, 57, 70, 0.15)'
          : '0 10px 30px rgba(0,0,0,0.4)',
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        animation: 'fadeInUp 0.5s ease forwards',
        animationDelay: `${index * 0.05}s`,
        opacity: 0,
        position: 'relative',
        height: '100%',
        minWidth: 0,
      }}
      itemScope
      itemType="https://schema.org/MenuItem"
    >
      {/* Glow Effect behind image on hover */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        height: '40%',
        background: 'var(--accent)',
        filter: 'blur(60px)',
        opacity: isHovered ? 0.15 : 0,
        transition: 'opacity 0.5s ease',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Image Container */}
      <div className="menu-card-image" style={{
        position: 'relative',
        height: '240px',
        width: '100%',
        overflow: 'hidden',
        flexShrink: 0,
        zIndex: 1,
      }}>
        <Image
          src={item.image}
          alt={`${item.name} — замовити з доставкою в Києві`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{
            objectFit: 'cover',
            transform: isHovered ? 'scale(1.08) rotate(1deg)' : 'scale(1)',
            transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        />

        {/* Soft dark gradient overlay for text readability */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(15,15,15,1) 0%, rgba(15,15,15,0.4) 40%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Cart quantity badge */}
        {totalQuantity > 0 && (
          <div style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'linear-gradient(135deg, var(--accent) 0%, #c1121f 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 800,
            boxShadow: '0 4px 15px rgba(230, 57, 70, 0.4)',
            animation: 'cartBounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            zIndex: 2,
          }}>
            <ShoppingCart size={14} style={{ marginRight: 6 }} />
            {totalQuantity}
          </div>
        )}

        {/* Weight Badge */}
        <div style={{
          position: 'absolute',
          top: 16,
          left: 16,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'var(--text-secondary)',
          borderRadius: '100px',
          padding: '4px 10px',
          fontSize: 12,
          fontWeight: 600,
          zIndex: 2,
        }}>
          {item.weight}
        </div>
      </div>

      {/* Content */}
      <div className="menu-card-content" style={{
        padding: '24px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1,
        marginTop: '-40px',
      }}>
        <div className="menu-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
          <h3
            itemProp="name"
            className="menu-card-title"
            style={{
              fontSize: 20,
              fontWeight: 800,
              lineHeight: 1.2,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              wordBreak: 'break-word',
            }}
          >
            {item.name}
          </h3>

          <div className="menu-card-price" style={{
            fontSize: 22,
            fontWeight: 900,
            color: 'white',
            whiteSpace: 'nowrap',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}>
            <span itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <span itemProp="price">{item.price}</span>
              <span itemProp="priceCurrency" className="menu-card-currency" content="UAH" style={{ fontSize: 16, color: 'var(--accent)', marginLeft: 2 }}>₴</span>
            </span>
          </div>
        </div>

        <p
          itemProp="description"
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: isSauce ? undefined : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: isSauce ? 12 : 20,
          }}
        >
          {isSauce ? 'Оберіть соус перед додаванням у кошик.' : item.description}
        </p>

        {isSauce && sauceOptions.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <select
              value={selectedSauce}
              onChange={(e) => setSelectedSauce(e.target.value)}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: 14,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {sauceOptions.map(opt => (
                <option key={opt} value={opt} style={{ color: 'black' }}>{opt}</option>
              ))}
            </select>
          </div>
        )}

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
            gap: 10,
            padding: '14px',
            borderRadius: '16px',
            border: added ? '1px solid rgba(72,199,116,0.3)' : '1px solid rgba(255,255,255,0.05)',
            background: added
              ? 'linear-gradient(135deg, rgba(72,199,116,0.2) 0%, rgba(72,199,116,0.1) 100%)'
              : (isHovered ? 'var(--accent)' : 'rgba(255,255,255,0.03)'),
            color: added ? '#48c774' : (isHovered ? 'white' : 'var(--text-primary)'),
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: (!added && isHovered) ? '0 8px 20px rgba(230, 57, 70, 0.4)' : 'none',
          }}
        >
          {added ? (
            <>
              <Check size={18} strokeWidth={3} />
              <span>Додано в кошик!</span>
            </>
          ) : (
            <>
              <Plus size={18} strokeWidth={2.5} />
              <span>Додати до кошика</span>
            </>
          )}
        </button>
      </div>
      </article>
    </Link>
  );
}
