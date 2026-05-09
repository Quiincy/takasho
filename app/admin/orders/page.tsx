'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, Order, OrderStatus } from '@/lib/supabase';
import { RefreshCw, Phone, MapPin, Clock, Package, ChevronDown } from 'lucide-react';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; next?: OrderStatus; nextLabel?: string }> = {
  new: {
    label: '🔴 Нове',
    color: '#e63946',
    bg: 'rgba(230,57,70,0.12)',
    next: 'preparing',
    nextLabel: '→ Готується',
  },
  preparing: {
    label: '🟡 Готується',
    color: '#f4a261',
    bg: 'rgba(244,162,97,0.12)',
    next: 'delivering',
    nextLabel: '→ В дорозі',
  },
  delivering: {
    label: '🔵 В дорозі',
    color: '#4ea8de',
    bg: 'rgba(78,168,222,0.12)',
    next: 'delivered',
    nextLabel: '→ Доставлено ✓',
  },
  delivered: {
    label: '🟢 Доставлено',
    color: '#48c774',
    bg: 'rgba(72,199,116,0.12)',
  },
  cancelled: {
    label: '❌ Скасовано',
    color: '#888',
    bg: 'rgba(136,136,136,0.1)',
  },
};

const FILTER_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Всі' },
  { value: 'new', label: '🔴 Нові' },
  { value: 'preparing', label: '🟡 Готуються' },
  { value: 'delivering', label: '🔵 В дорозі' },
  { value: 'delivered', label: '🟢 Доставлено' },
  { value: 'cancelled', label: '❌ Скасовано' },
];

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function timeSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} хв тому`;
  return `${Math.floor(mins / 60)} год тому`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newCount, setNewCount] = useState(0);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setOrders(data as Order[]);
      setNewCount(data.filter((o: Order) => o.status === 'new').length);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();

    // Realtime subscription
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newOrder = payload.new as Order;
          setOrders(prev => [newOrder, ...prev]);
          setNewCount(c => c + 1);
          // Sound notification
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
          } catch {}
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Order;
          setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadOrders]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const stats = {
    new: orders.filter(o => o.status === 'new').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    delivering: orders.filter(o => o.status === 'delivering').length,
    todayRevenue: orders
      .filter(o => {
        const d = new Date(o.created_at);
        const today = new Date();
        return d.toDateString() === today.toDateString() && o.status !== 'cancelled';
      })
      .reduce((s, o) => s + o.total_price + o.delivery_cost, 0),
  };

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
            📦 Замовлення
            {newCount > 0 && (
              <span style={{
                marginLeft: 10, background: 'var(--accent)', color: 'white',
                borderRadius: 100, padding: '2px 10px', fontSize: 14, fontWeight: 700,
              }}>
                {newCount} нових
              </span>
            )}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Оновлюється в реальному часі</p>
        </div>
        <button
          onClick={loadOrders}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 10, color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer',
          }}
        >
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Оновити
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Нових', value: stats.new, color: '#e63946', icon: '🔴' },
          { label: 'Готується', value: stats.preparing, color: '#f4a261', icon: '🟡' },
          { label: 'В дорозі', value: stats.delivering, color: '#4ea8de', icon: '🔵' },
          { label: 'Виручка сьогодні', value: `${stats.todayRevenue} ₴`, color: '#48c774', icon: '💰' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px 20px',
          }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value as OrderStatus | 'all')}
            style={{
              padding: '8px 16px', borderRadius: 100, border: '1px solid',
              borderColor: filter === opt.value ? 'var(--accent)' : 'var(--border)',
              background: filter === opt.value ? 'rgba(230,57,70,0.12)' : 'var(--bg-card)',
              color: filter === opt.value ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: filter === opt.value ? 600 : 400, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          ⏳ Завантаження...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p>Замовлень немає</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(order => {
            const cfg = STATUS_CONFIG[order.status];
            const isUpdating = updatingId === order.id;
            return (
              <div
                key={order.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid',
                  borderColor: order.status === 'new' ? 'rgba(230,57,70,0.3)' : 'var(--border)',
                  borderRadius: 14,
                  padding: '20px 24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                  {/* Left: customer info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        padding: '3px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                        background: cfg.bg, color: cfg.color,
                      }}>
                        {cfg.label}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                        {formatTime(order.created_at)} · {timeSince(order.created_at)}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{order.customer_name}</div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <a
                        href={`tel:${order.customer_phone}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--accent)', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}
                      >
                        <Phone size={13} />
                        {order.customer_phone}
                      </a>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontSize: 14 }}>
                        <MapPin size={13} />
                        {order.delivery_address}
                        {order.distance_km && (
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({order.distance_km.toFixed(1)} км)</span>
                        )}
                      </span>
                    </div>
                    {order.comment && (
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        💬 {order.comment}
                      </div>
                    )}
                  </div>

                  {/* Right: total + actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent)', textAlign: 'right' }}>
                        {order.total_price + order.delivery_cost} ₴
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
                        {order.total_price} ₴ + {order.delivery_cost} ₴ доставка
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      {cfg.next && (
                        <button
                          onClick={() => updateStatus(order.id, cfg.next!)}
                          disabled={isUpdating}
                          style={{
                            padding: '8px 16px', borderRadius: 8, border: 'none',
                            background: 'linear-gradient(135deg, var(--accent), #c1121f)',
                            color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            opacity: isUpdating ? 0.6 : 1,
                          }}
                        >
                          {isUpdating ? '⏳' : cfg.nextLabel}
                        </button>
                      )}
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button
                          onClick={() => updateStatus(order.id, 'cancelled')}
                          disabled={isUpdating}
                          style={{
                            padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
                            background: 'transparent', color: 'var(--text-muted)',
                            fontSize: 13, cursor: 'pointer',
                          }}
                        >
                          Скасувати
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div style={{
                  borderTop: '1px solid var(--border)', paddingTop: 14,
                  display: 'flex', flexWrap: 'wrap', gap: 8,
                }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'var(--bg-secondary)', borderRadius: 8,
                      padding: '5px 12px', fontSize: 13,
                    }}>
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                      <span style={{
                        background: 'var(--accent)', color: 'white',
                        borderRadius: 100, padding: '0 6px', fontSize: 11, fontWeight: 700,
                      }}>
                        ×{item.quantity}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>{item.price * item.quantity} ₴</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
