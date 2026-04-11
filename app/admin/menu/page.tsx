'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, StopListItem } from '@/lib/supabase';
import { menuItems, categories } from '@/lib/menu-data';
import { Search, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';

export default function AdminMenuPage() {
  const [stopList, setStopList] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [saving, setSaving] = useState<string | null>(null);

  const loadStopList = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('menu_stop_list').select('*');
    if (data) {
      const map: Record<string, boolean> = {};
      (data as StopListItem[]).forEach(item => {
        map[item.item_id] = !item.is_available; // true = in stop list
      });
      setStopList(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadStopList(); }, [loadStopList]);

  const toggleItem = async (itemId: string) => {
    setSaving(itemId);
    const isCurrentlyStopped = stopList[itemId] ?? false;
    const newStopped = !isCurrentlyStopped;

    setStopList(prev => ({ ...prev, [itemId]: newStopped }));

    const { error } = await supabase
      .from('menu_stop_list')
      .upsert(
        { item_id: itemId, is_available: !newStopped, updated_at: new Date().toISOString() },
        { onConflict: 'item_id' }
      );

    if (error) {
      // Rollback
      setStopList(prev => ({ ...prev, [itemId]: isCurrentlyStopped }));
      alert('Помилка збереження: ' + error.message);
    }
    setSaving(null);
  };

  const filtered = menuItems.filter(item => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stopCount = Object.values(stopList).filter(Boolean).length;

  return (
    <div style={{ padding: '32px', minHeight: '100vh', overflow: 'hidden', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
          🚫 Стоп-лист меню
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Вимкніть страву — клієнти побачать &quot;Тимчасово недоступно&quot;
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{
          padding: '14px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, minWidth: 140,
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#48c774' }}>
            {menuItems.length - stopCount}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Доступних страв</div>
        </div>
        {stopCount > 0 && (
          <div style={{
            padding: '14px 20px', background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.25)',
            borderRadius: 12, minWidth: 140,
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>{stopCount}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>В стоп-листі</div>
          </div>
        )}
      </div>

      {stopCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
          background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)',
          borderRadius: 10, marginBottom: 20, fontSize: 14, color: 'var(--accent)',
        }}>
          <AlertCircle size={16} />
          {stopCount} {stopCount === 1 ? 'страва' : 'страви'} зараз недоступні для замовлення
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          id="stop-list-search"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Пошук страви..."
          style={{
            width: '100%', padding: '11px 16px 11px 42px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, outline: 'none',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
        {[{ id: 'all', name: 'Всі', emoji: '🍽️' }, ...categories].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '7px 16px', borderRadius: 100, border: '1px solid', whiteSpace: 'nowrap',
              borderColor: activeCategory === cat.id ? 'var(--accent)' : 'var(--border)',
              background: activeCategory === cat.id ? 'rgba(230,57,70,0.1)' : 'var(--bg-card)',
              color: activeCategory === cat.id ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Items list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>⏳ Завантаження...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(item => {
            const isStopped = stopList[item.id] ?? false;
            const isSaving = saving === item.id;

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px',
                  background: isStopped ? 'rgba(230,57,70,0.05)' : 'var(--bg-card)',
                  border: '1px solid',
                  borderColor: isStopped ? 'rgba(230,57,70,0.2)' : 'var(--border)',
                  borderRadius: 12,
                  transition: 'all 0.2s',
                  opacity: isSaving ? 0.6 : 1,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600, fontSize: 15, marginBottom: 2,
                    color: isStopped ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: isStopped ? 'line-through' : 'none',
                  }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {item.weight} · {item.price} ₴ ·{' '}
                    {categories.find(c => c.id === item.category)?.emoji}{' '}
                    {categories.find(c => c.id === item.category)?.name}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  {isStopped && (
                    <span style={{
                      padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                      background: 'rgba(230,57,70,0.1)', color: 'var(--accent)',
                      border: '1px solid rgba(230,57,70,0.3)',
                    }}>
                      СТОП
                    </span>
                  )}
                  <button
                    id={`stop-${item.id}`}
                    onClick={() => toggleItem(item.id)}
                    disabled={isSaving}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', borderRadius: 8, border: '1px solid',
                      borderColor: isStopped ? '#48c774' : 'rgba(230,57,70,0.3)',
                      background: isStopped ? 'rgba(72,199,116,0.1)' : 'rgba(230,57,70,0.08)',
                      color: isStopped ? '#48c774' : 'var(--accent)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    {isSaving ? '⏳' : isStopped
                      ? <><ToggleRight size={16} /> Відновити</>
                      : <><ToggleLeft size={16} /> Стоп</>
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
