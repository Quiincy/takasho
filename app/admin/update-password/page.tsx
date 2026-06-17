'use client';

import { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { updatePassword } from '../actions';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Паролі не співпадають');
    }
    if (password.length < 6) {
      return setError('Пароль має містити мінімум 6 символів');
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('password', password);

    const res = await updatePassword(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push('/admin/orders');
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
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Enot Sushi</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <ShieldCheck size={14} />
            Встановлення пароля
          </p>
        </div>

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontWeight: 500 }}>
              Новий пароль
            </label>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <Lock size={16} style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }} />
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Мінімум 6 символів"
                autoFocus
                style={{
                  width: '100%',
                  padding: '13px 14px 13px 42px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid',
                  borderColor: error ? 'var(--accent)' : 'var(--border)',
                  borderRadius: 10,
                  color: 'var(--text-primary)',
                  fontSize: 15,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            <label style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontWeight: 500 }}>
              Повторіть пароль
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }} />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                placeholder="Повторіть пароль"
                style={{
                  width: '100%',
                  padding: '13px 14px 13px 42px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid',
                  borderColor: error ? 'var(--accent)' : 'var(--border)',
                  borderRadius: 10,
                  color: 'var(--text-primary)',
                  fontSize: 15,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
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
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="btn-primary"
            style={{
              padding: '14px',
              fontSize: 15,
              opacity: (!password || !confirmPassword) ? 0.5 : 1,
              cursor: (!password || !confirmPassword) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '⏳ Збереження...' : '✅ Зберегти пароль'}
          </button>
        </form>
      </div>
    </div>
  );
}
