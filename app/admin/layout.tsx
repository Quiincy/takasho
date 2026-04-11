'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, LayoutGrid, LogOut, ChevronRight, BookOpen } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('tks_admin');
    if (!token && pathname !== '/admin') {
      router.replace('/admin');
    } else {
      setChecked(true);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('tks_admin');
    router.push('/admin');
  };

  // On login page — just render children
  if (pathname === '/admin') {
    return <>{children}</>;
  }

  if (!checked) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
      }}>
        Перевірка доступу...
      </div>
    );
  }

  const navItems = [
    { href: '/admin/orders',  label: 'Замовлення',    icon: <ShoppingBag size={18} /> },
    { href: '/admin/menu',    label: 'Стоп-лист',     icon: <LayoutGrid size={18} /> },
    { href: '/admin/catalog', label: 'Редактор меню', icon: <BookOpen size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', overflowX: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, var(--accent), #c1121f)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}>🍣</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>Так а Шо</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>АДМІНКА</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 14px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  background: active ? 'rgba(230,57,70,0.12)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: active ? 600 : 400,
                  fontSize: 14,
                  transition: 'all 0.2s',
                  border: active ? '1px solid rgba(230,57,70,0.2)' : '1px solid transparent',
                }}
              >
                {item.icon}
                {item.label}
                {active && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <Link
            href="/"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 8,
              color: 'var(--text-muted)',
              fontSize: 13,
              textDecoration: 'none',
              marginBottom: 4,
            }}
          >
            🌐 Переглянути сайт
          </Link>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 13,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <LogOut size={15} />
            Вийти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh', minWidth: 0, overflow: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}
