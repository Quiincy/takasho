'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactSchedule, setContactSchedule] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*');

        if (error) {
          // If the table doesn't exist yet, PostgREST returns PGRST205
          if (error.code === '42P01' || error.code === 'PGRST205') {
            setMessage({ type: 'error', text: '⚠️ Таблиця site_settings ще не створена в Supabase. Виконайте SQL-скрипт з інструкції.' });
            return;
          }
          throw error;
        }

        if (data) {
          const tokenSetting = data.find(s => s.key === 'telegram_bot_token');
          const chatSetting = data.find(s => s.key === 'telegram_chat_id');
          const phoneSetting = data.find(s => s.key === 'contact_phone');
          const addressSetting = data.find(s => s.key === 'contact_address');
          const scheduleSetting = data.find(s => s.key === 'contact_schedule');
          
          if (tokenSetting) setBotToken(tokenSetting.value);
          if (chatSetting) setChatId(chatSetting.value);
          if (phoneSetting) setContactPhone(phoneSetting.value);
          if (addressSetting) setContactAddress(addressSetting.value);
          if (scheduleSetting) setContactSchedule(scheduleSetting.value);
        }
      } catch (err: any) {
        console.error('Error loading settings:', err);
        setMessage({ type: 'error', text: `Помилка завантаження: ${err?.message || JSON.stringify(err)}` });
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const updates = [
        { key: 'telegram_bot_token', value: botToken, updated_at: new Date().toISOString() },
        { key: 'telegram_chat_id', value: chatId, updated_at: new Date().toISOString() },
        { key: 'contact_phone', value: contactPhone, updated_at: new Date().toISOString() },
        { key: 'contact_address', value: contactAddress, updated_at: new Date().toISOString() },
        { key: 'contact_schedule', value: contactSchedule, updated_at: new Date().toISOString() }
      ];

      const { error } = await supabase
        .from('site_settings')
        .upsert(updates);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Налаштування успішно збережено!' });
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setMessage({ type: 'error', text: err?.message || 'Помилка при збереженні' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestMessage = async () => {
    if (!botToken || !chatId) {
      setMessage({ type: 'error', text: 'Спочатку введіть та збережіть токен та Chat ID' });
      return;
    }
    
    setTesting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: '✅ Це тестове повідомлення з адмін-панелі Enot Sushi!\nІнтеграція працює чудово.',
          parse_mode: 'HTML'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.description || 'Помилка відправки в Telegram');
      }

      setMessage({ type: 'success', text: 'Тестове повідомлення успішно відправлено!' });
    } catch (err: any) {
      console.error('Test message error:', err);
      setMessage({ type: 'error', text: `Помилка: ${err.message}` });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Завантаження налаштувань...</div>;
  }

  return (
    <div className="admin-page-container" style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Налаштування сайту</h1>
      
      <div style={{ 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border)', 
        borderRadius: 16, 
        padding: 30 
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Telegram сповіщення</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
          Вкажіть токен вашого Telegram-бота та ID чату (або групи), куди мають надходити нові замовлення.
          Створити бота можна через <b>@BotFather</b> у Telegram.
        </p>

        {message.text && (
          <div style={{ 
            padding: '12px 16px', 
            borderRadius: 8, 
            marginBottom: 24,
            fontSize: 14,
            background: message.type === 'error' ? 'rgba(230,57,70,0.1)' : 'rgba(72,199,116,0.1)',
            color: message.type === 'error' ? 'var(--accent)' : '#48c774',
            border: `1px solid ${message.type === 'error' ? 'rgba(230,57,70,0.2)' : 'rgba(72,199,116,0.2)'}`
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          {/* Telegram Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Telegram Bot Token
              </label>
            <input
              type="text"
              value={botToken}
              onChange={e => setBotToken(e.target.value)}
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz..."
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Telegram Chat ID
            </label>
            <input
              type="text"
              value={chatId}
              onChange={e => setChatId(e.target.value)}
              placeholder="-1001234567890 або 123456789"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              Щоб дізнатися Chat ID, додайте бота в групу (або напишіть йому) і використайте бота <b>@getmyid_bot</b>.
            </p>
          </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
          
          {/* Contact Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Контактна інформація</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8, lineHeight: 1.5 }}>
              Ці дані відображатимуться у футері, хедері та на сторінці контактів.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Номер телефону
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="+380 95 797 29 43"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Адреса закладу
              </label>
              <input
                type="text"
                value={contactAddress}
                onChange={e => setContactAddress(e.target.value)}
                placeholder="вул. Едуарда Вільде, 10Б, Дніпровський район, м. Київ"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Графік роботи
              </label>
              <input
                type="text"
                value={contactSchedule}
                onChange={e => setContactSchedule(e.target.value)}
                placeholder="Пн-Нд: 10:00 – 21:00"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
            <button 
              type="submit" 
              disabled={saving}
              className="btn-primary"
              style={{ 
                padding: '12px 24px', 
                borderRadius: 8, 
                fontSize: 14,
                opacity: saving ? 0.7 : 1,
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Збереження...' : 'Зберегти налаштування'}
            </button>

            <button 
              type="button" 
              onClick={handleTestMessage}
              disabled={testing || !botToken || !chatId}
              style={{ 
                padding: '12px 24px', 
                borderRadius: 8, 
                fontSize: 14,
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                opacity: (testing || !botToken || !chatId) ? 0.5 : 1,
                cursor: (testing || !botToken || !chatId) ? 'not-allowed' : 'pointer'
              }}
            >
              {testing ? 'Відправка...' : 'Відправити тестове повідомлення'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
