'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp, Paperclip, Loader2 } from 'lucide-react';
import { supabase, type DbCategory, type DbMenuItem } from '@/lib/supabase';

/* ── helpers ── */
const EMOJI_LIST = ['🍕','🍣','🍔','🌭','🥗','🍲','🔥','⚡','🥩','🍤','🍱','🌮','🍜','🥘'];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

/* ── small reusable input ── */
function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string | number; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: '9px 13px', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 9, color: 'var(--text-primary)', fontSize: 14, outline: 'none', width: '100%',
          boxSizing: 'border-box',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
      />
    </div>
  );
}

/* ── image upload field ── */
function ImageUploadField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('menu_images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('menu_images').getPublicUrl(filePath);
      onChange(data.publicUrl);
    } catch (error: any) {
      alert('Помилка завантаження зображення: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Зображення</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="/pizza.png або URL"
          style={{
            flex: 1, padding: '9px 13px', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 9, color: 'var(--text-primary)', fontSize: 14, outline: 'none', minWidth: 0,
            boxSizing: 'border-box'
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
        <label style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 38, height: 38, background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 9, cursor: uploading ? 'not-allowed' : 'pointer', flexShrink: 0,
          color: uploading ? 'var(--text-muted)' : 'var(--text-primary)'
        }} title="Завантажити з пристрою">
          {uploading ? <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : <Paperclip size={16} />}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
        </label>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ══════════════════ MAIN PAGE ══════════════════ */
export default function AdminMenuEditorPage() {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [items, setItems] = useState<DbMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // which category is expanded
  const [expanded, setExpanded] = useState<string | null>(null);
  // add category form
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', emoji: '🍽️' });
  const [savingCat, setSavingCat] = useState(false);

  // add item form
  const [addItemFor, setAddItemFor] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: '', price: '', weight: '', description: '', image: '', category_id: '', is_popular: false });
  const [savingItem, setSavingItem] = useState(false);

  // edit item
  const [editingItem, setEditingItem] = useState<DbMenuItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/menu', { cache: 'no-store' });
    const data = await res.json();
    setCategories((data.categories ?? []).filter((c: DbCategory) => !c.id.startsWith('banquet-')));
    setItems(data.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ─── Category actions ─── */
  const addCategory = async () => {
    if (!newCat.name.trim()) return;
    setSavingCat(true);
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'category', name: newCat.name.trim(), emoji: newCat.emoji }),
      });
      if (res.ok) {
        setNewCat({ name: '', emoji: '🍽️' });
        setShowAddCat(false);
        await load();
      } else {
        const d = await res.json();
        setError(d.error ?? 'Помилка');
      }
    } catch (err: any) {
      setError(`Мережева помилка: ${err.message}`);
    }
    setSavingCat(false);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Видалити категорію та всі її страви?')) return;
    try {
      const res = await fetch('/api/menu', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'category', id }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      await load();
    } catch (err: any) {
      setError(`Мережева помилка: ${err.message}`);
    }
  };

  /* ─── Item actions ─── */
  const addItem = async (categoryId: string) => {
    if (!newItem.name.trim() || !newItem.price) return;
    setSavingItem(true);
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'item',
          category_id: categoryId,
          name: newItem.name.trim(),
          price: Number(newItem.price),
          weight: newItem.weight.trim(),
          description: newItem.description.trim() || null,
          image: newItem.image.trim() || '/pizza.png',
          is_popular: newItem.is_popular,
        }),
      });
      if (res.ok) {
        setNewItem({ name: '', price: '', weight: '', description: '', image: '', category_id: '', is_popular: false });
        setAddItemFor(null);
        await load();
      } else {
        const d = await res.json();
        setError(d.error ?? 'Помилка');
      }
    } catch (err: any) {
      setError(`Мережева помилка: ${err.message}`);
    }
    setSavingItem(false);
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Видалити страву?')) return;
    await fetch('/api/menu', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'item', id }),
    });
    await load();
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    setSavingEdit(true);
    const { id, created_at, ...data } = editingItem;
    await fetch('/api/menu', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'item', id, ...data }),
    });
    setEditingItem(null);
    setSavingEdit(false);
    await load();
  };

  /* ── render ── */
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>⏳ Завантаження...</div>;

  return (
    <div className="admin-page-container" style={{ maxWidth: 860 }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 4 }}>📋 Редактор меню</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{categories.length} категорій · {items.length} страв</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setShowAddCat(v => !v); setAddItemFor(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
              border: '1px solid var(--border)', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Нова категорія
          </button>
          {categories.length > 0 && (
            <button
              onClick={() => { setAddItemFor('global'); setShowAddCat(false); setNewItem({ name: '', price: '', weight: '', description: '', image: '', category_id: '', is_popular: false }); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 16px', background: 'var(--accent)', color: 'white',
                border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}
            >
              <Plus size={16} /> Нова страва
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(230,57,70,.1)', border: '1px solid rgba(230,57,70,.3)', borderRadius: 10, color: 'var(--accent)', fontSize: 14, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          ❌ {error}
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}><X size={16} /></button>
        </div>
      )}

      {/* Global Add Item form */}
      {addItemFor === 'global' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--accent)', borderRadius: 14, padding: 20, marginBottom: 20, boxShadow: '0 4px 12px rgba(230,57,70,0.1)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>➕ Нова страва</p>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Категорія *</label>
            <select
              value={newItem.category_id || categories[0]?.id}
              onChange={e => setNewItem(p => ({ ...p, category_id: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
          <div className="admin-grid-2" style={{ marginBottom: 10 }}>
            <Field label="Назва *" value={newItem.name} onChange={v => setNewItem(p => ({ ...p, name: v }))} placeholder="Піца Маргарита" />
            <Field label="Ціна (₴) *" type="number" value={newItem.price} onChange={v => setNewItem(p => ({ ...p, price: v }))} placeholder="280" />
            <Field label="Вага/обсяг" value={newItem.weight} onChange={v => setNewItem(p => ({ ...p, weight: v }))} placeholder="450 г" />
            <ImageUploadField value={newItem.image} onChange={v => setNewItem(p => ({ ...p, image: v }))} />
          </div>
          <Field label="Опис" value={newItem.description} onChange={v => setNewItem(p => ({ ...p, description: v }))} placeholder="Томатний соус, моцарела..." />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginTop: 10, color: 'var(--text-primary)' }}>
            <input type="checkbox" checked={newItem.is_popular} onChange={e => setNewItem(p => ({ ...p, is_popular: e.target.checked }))} />
            Популярна страва (показувати на головній)
          </label>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={() => addItem(newItem.category_id || categories[0]?.id)} disabled={savingItem} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              <Plus size={16} /> {savingItem ? '⏳' : 'Додати страву'}
            </button>
            <button onClick={() => setAddItemFor(null)} style={{ padding: '9px 16px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Скасувати</button>
          </div>
        </div>
      )}

      {/* Add category form */}
      {showAddCat && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(230,57,70,.3)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>➕ Нова категорія</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, marginBottom: 12 }}>
            <Field label="Назва *" value={newCat.name} onChange={v => setNewCat(p => ({ ...p, name: v }))} placeholder="Наприклад: Десерти" />
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Іконка</label>
              <select
                value={newCat.emoji}
                onChange={e => setNewCat(p => ({ ...p, emoji: e.target.value }))}
                style={{ padding: '9px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text-primary)', fontSize: 18, cursor: 'pointer' }}
              >
                {EMOJI_LIST.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addCategory} disabled={savingCat} style={{ padding: '9px 20px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              {savingCat ? '⏳' : '✓ Додати'}
            </button>
            <button onClick={() => setShowAddCat(false)} style={{ padding: '9px 16px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Скасувати</button>
          </div>
        </div>
      )}

      {/* Categories list */}
      {categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p>Категорій ще немає. Створіть першу!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {categories.map(cat => {
            const catItems = items.filter(i => i.category_id === cat.id);
            const isOpen = expanded === cat.id;

            return (
              <div key={cat.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                {/* Category header */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => setExpanded(isOpen ? null : cat.id)}
                >
                  <span style={{ fontSize: 24 }}>{cat.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{cat.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{catItems.length} страв</div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteCategory(cat.id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 6, display: 'flex' }}
                    title="Видалити категорію"
                  >
                    <Trash2 size={15} />
                  </button>
                  {isOpen ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />}
                </div>

                {/* Expanded: items list + add form */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '14px 20px' }}>
                    {/* Items */}
                    {catItems.length === 0 ? (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>Страв немає. Додайте першу!</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                        {catItems.map(item => (
                          <div key={item.id}>
                            {/* Item row */}
                            <div style={{ 
                              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', 
                              background: editingItem?.id === item.id ? 'var(--bg-card)' : (item.is_available ? 'var(--bg-secondary)' : 'rgba(230,57,70,.06)'), 
                              borderRadius: 10, 
                              border: editingItem?.id === item.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                              boxShadow: editingItem?.id === item.id ? '0 0 0 1px var(--accent)' : 'none'
                            }}>
                              <img src={item.image} alt={item.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).src = '/pizza.png'; }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 1 }}>{item.name} {item.is_popular && <span title="Популярна страва" style={{ marginLeft: 4 }}>🔥</span>}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.weight && `${item.weight} · `}{item.price} ₴</div>
                              </div>
                              <button onClick={() => setEditingItem(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: editingItem?.id === item.id ? 'var(--accent)' : 'var(--text-muted)', padding: 6, borderRadius: 6, display: 'flex' }}>
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => deleteItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 6, display: 'flex' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {editingItem?.id === item.id && (
                              /* Edit form */
                              <div style={{ 
                                background: 'var(--bg-secondary)', borderRadius: 10, padding: 14, 
                                border: '1px solid rgba(230,57,70,.25)', marginTop: 8,
                                animation: 'slideDown 0.2s ease-out'
                              }}>
                                <div className="admin-grid-2" style={{ marginBottom: 10 }}>
                                  <Field label="Назва *" value={editingItem.name} onChange={v => setEditingItem(p => p ? { ...p, name: v } : p)} />
                                  <Field label="Ціна (₴) *" type="number" value={editingItem.price} onChange={v => setEditingItem(p => p ? { ...p, price: Number(v) } : p)} />
                                  <Field label="Вага/обсяг" value={editingItem.weight} onChange={v => setEditingItem(p => p ? { ...p, weight: v } : p)} placeholder="450 г" />
                                  <ImageUploadField value={editingItem.image} onChange={v => setEditingItem(p => p ? { ...p, image: v } : p)} />
                                </div>
                                <Field label="Опис" value={editingItem.description ?? ''} onChange={v => setEditingItem(p => p ? { ...p, description: v } : p)} placeholder="Короткий опис страви..." />
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginTop: 10, color: 'var(--text-primary)' }}>
                                  <input type="checkbox" checked={editingItem.is_popular ?? false} onChange={e => setEditingItem(p => p ? { ...p, is_popular: e.target.checked } : p)} />
                                  Популярна страва (показувати на головній)
                                </label>
                                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                  <button onClick={saveEdit} disabled={savingEdit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#48c774', border: 'none', borderRadius: 7, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                    <Check size={14} /> Зберегти
                                  </button>
                                  <button onClick={() => setEditingItem(null)} style={{ padding: '8px 14px', background: 'none', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Скасувати</button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add item */}
                    {addItemFor === cat.id ? (
                      <div style={{ background: 'rgba(230,57,70,.05)', border: '1px solid rgba(230,57,70,.2)', borderRadius: 10, padding: 14 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>➕ Нова страва</p>
                        <div className="admin-grid-2" style={{ marginBottom: 10 }}>
                          <Field label="Назва *" value={newItem.name} onChange={v => setNewItem(p => ({ ...p, name: v }))} placeholder="Піца Маргарита" />
                          <Field label="Ціна (₴) *" type="number" value={newItem.price} onChange={v => setNewItem(p => ({ ...p, price: v }))} placeholder="280" />
                          <Field label="Вага/обсяг" value={newItem.weight} onChange={v => setNewItem(p => ({ ...p, weight: v }))} placeholder="450 г" />
                          <ImageUploadField value={newItem.image} onChange={v => setNewItem(p => ({ ...p, image: v }))} />
                        </div>
                        <Field label="Опис" value={newItem.description} onChange={v => setNewItem(p => ({ ...p, description: v }))} placeholder="Томатний соус, моцарела..." />
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginTop: 10, color: 'var(--text-primary)' }}>
                          <input type="checkbox" checked={newItem.is_popular} onChange={e => setNewItem(p => ({ ...p, is_popular: e.target.checked }))} />
                          Популярна страва (показувати на головній)
                        </label>
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <button onClick={() => addItem(cat.id)} disabled={savingItem} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 7, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            <Plus size={14} /> {savingItem ? '⏳' : 'Додати страву'}
                          </button>
                          <button onClick={() => setAddItemFor(null)} style={{ padding: '8px 14px', background: 'none', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Скасувати</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddItemFor(cat.id); setNewItem({ name: '', price: '', weight: '', description: '', image: '', category_id: '', is_popular: false }); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'none', border: '1px dashed var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', width: '100%', justifyContent: 'center' }}
      >
                        <Plus size={14} /> Додати страву до «{cat.name}»
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
