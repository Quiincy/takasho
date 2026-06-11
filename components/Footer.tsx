'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSiteSettings } from '@/lib/settings-context';
import { Phone, MapPin, Clock, Mail, Truck, Utensils, FileText } from 'lucide-react';
export default function Footer() {
  const { contact_phone, contact_address, contact_schedule, contact_email, fop_name } = useSiteSettings();
  return (
    <footer style={{
      position: 'relative',
      background: 'linear-gradient(to bottom, var(--bg-secondary) 0%, #0a0a0a 100%)',
      borderTop: '1px solid rgba(230,57,70,0.2)',
      padding: 'clamp(40px, 8vw, 60px) 20px clamp(30px, 6vw, 40px)',
      overflow: 'hidden',
    }}>
      {/* Decorative background glow */}
      <div style={{
        position: 'absolute',
        top: -100,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        height: 200,
        background: 'radial-gradient(ellipse at center, rgba(230,57,70,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      <div
        className="footer-inner reveal"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 'clamp(32px, 6vw, 100px)',
        }}
      >
        {/* Brand */}
        <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, flex: '1 1 auto', minWidth: 260, maxWidth: 320 }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Image 
              src="/logo_red.png" 
              alt="Enot Sushi Logo" 
              width={40} 
              height={40} 
              style={{ 
                borderRadius: 10, 
                objectFit: 'cover',
                boxShadow: '0 4px 12px rgba(230,57,70,0.3)',
              }} 
            />
            <span style={{ background: 'linear-gradient(90deg, #fff, #ffe5e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ENOT SUSHI
            </span>
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 280 }}>
            Найшвидша доставка їжі в Києві. Замовляй улюблені суші, піцу та бургери в один клік!
          </p>
        </div>

        {/* Contacts */}
        <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'clamp(12px, 3vw, 16px)', flex: '1 1 auto', minWidth: 260, maxWidth: 320 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Контакти</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <a href={`tel:${contact_phone.replace(/[^0-9+]/g, '')}`} style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 10,
              color: 'white', textDecoration: 'none', fontSize: 18, fontWeight: 700,
              background: 'rgba(230,57,70,0.1)', padding: '8px 16px', borderRadius: 12, border: '1px solid rgba(230,57,70,0.2)', width: 'fit-content',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(230,57,70,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(230,57,70,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Phone size={18} /> {contact_phone}
            </a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
                <MapPin size={16} style={{ flexShrink: 0, marginTop: 3 }} /> <span style={{ textAlign: 'left' }}>{contact_address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5, whiteSpace: 'nowrap' }}>
                <Clock size={16} style={{ flexShrink: 0 }} /> <span>{contact_schedule}</span>
              </div>
              <a href={`mailto:${contact_email}`} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5, whiteSpace: 'nowrap', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                <Mail size={16} style={{ flexShrink: 0, transform: 'translateY(-1px)' }} />
                <span>{contact_email}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'clamp(12px, 3vw, 16px)', flex: '1 1 auto', minWidth: 260, maxWidth: 320 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Клієнтам</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
            <Link href="/delivery" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 15, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <Truck size={16} /> Доставка та оплата
            </Link>
            <Link href="/contacts" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 15, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <MapPin size={16} /> Контакти
            </Link>
            <Link href="/banquet" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 15, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <Utensils size={16} /> Банкетне меню
            </Link>
            <Link href="/privacy-policy" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 15, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <FileText size={16} /> Публічна оферта
            </Link>
          </div>
        </div>
      </div>

      {/* Payment Logos */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, marginTop: 40, position: 'relative', zIndex: 1 }}>
        <img src="/mastercard.svg" alt="Mastercard" style={{ height: 32 }} />
        <img src="/visa.svg" alt="Visa" style={{ height: 24 }} />
        <div 
          style={{ 
            fontSize: 22, fontWeight: 900, letterSpacing: '-0.05em', cursor: 'default', display: 'flex', alignItems: 'center' 
          }}
        >
          <span style={{ color: '#fff' }}>Liq</span><span style={{ color: '#7ab12c' }}>Pay</span>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: 'clamp(32px, 6vw, 60px) auto 0', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, width: '100%' }}>© 2026 Enot Sushi. {fop_name}. Всі права захищено.</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, width: '100%' }}>
          Створено <a href="https://t.me/Quincyy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Quincy</a> з ❤️ в Україні.
        </div>
      </div>
    </footer>
  );
}
