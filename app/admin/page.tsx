'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await new Promise(r => setTimeout(r, 400)); // UX delay

    const correct = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'takasho2024';
    if (password === correct) {
      localStorage.setItem('tks_admin', btoa(password + Date.now()));
      router.push('/admin/orders');
    } else {
      setError('Невірний пароль');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: 40,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, var(--accent), #c1121f)',
            borderRadius: 18,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            marginBottom: 16,
            boxShadow: '0 8px 24px rgba(230,57,70,0.4)',
          }}>🍣</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Так а Шо</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <ShieldCheck size={14} />
            Панель адміністратора
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="admin-password" style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontWeight: 500 }}>
              Пароль
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }} />
              <input
                id="admin-password"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Введіть пароль..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '13px 44px 13px 42px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid',
                  borderColor: error ? 'var(--accent)' : 'var(--border)',
                  borderRadius: 10,
                  color: 'var(--text-primary)',
                  fontSize: 15,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { if (!error) e.target.style.borderColor = 'rgba(230,57,70,0.5)'; }}
                onBlur={e => { if (!error) e.target.style.borderColor = 'var(--border)'; }}
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', display: 'flex',
                }}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(230,57,70,0.1)',
              border: '1px solid rgba(230,57,70,0.3)',
              borderRadius: 8,
              color: 'var(--accent)',
              fontSize: 14,
            }}>
              ❌ {error}
            </div>
          )}

          <button
            id="admin-login-btn"
            type="submit"
            disabled={loading || !password}
            className="btn-primary"
            style={{
              padding: '14px',
              fontSize: 15,
              opacity: !password ? 0.5 : 1,
              cursor: !password ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '⏳ Перевірка...' : '🔓 Увійти'}
          </button>
        </form>
      </div>
    </div>
  );
}
