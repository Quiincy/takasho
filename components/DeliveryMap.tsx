'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { MapPin, Bike, AlertCircle } from 'lucide-react';

const RESTAURANT_LAT = 50.5102;
const RESTAURANT_LNG = 30.6368;
const FREE_DELIVERY_KM = 1;
const TAXI_RATE_PER_KM = 9; // UAH per km average

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calcDeliveryCost(distanceKm: number): number {
  if (distanceKm <= FREE_DELIVERY_KM) return 0;
  const extra = distanceKm - FREE_DELIVERY_KM;
  return Math.round(extra * TAXI_RATE_PER_KM * 0.5);
}

interface Props {
  onDistanceChange: (km: number, cost: number) => void;
  address: string;
}

export default function DeliveryMap({ onDistanceChange, address }: Props) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      // Fix default icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (mapRef.current) return;

      const map = L.map('delivery-map', {
        center: [RESTAURANT_LAT, RESTAURANT_LNG],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Restaurant marker
      const restIcon = L.divIcon({
        html: `<div style="
          width:36px;height:36px;
          background:linear-gradient(135deg,#e63946,#c1121f);
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 15px rgba(230,57,70,0.5);
          border:2px solid white;
        "><span style="transform:rotate(45deg);font-size:16px">🍣</span></div>`,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      L.marker([RESTAURANT_LAT, RESTAURANT_LNG], { icon: restIcon })
        .addTo(map)
        .bindPopup('<b>Enot Sushi</b><br>вул. Едуарда Вільде, 10Б');

      // 5km free delivery circle
      circleRef.current = L.circle([RESTAURANT_LAT, RESTAURANT_LNG], {
        radius: FREE_DELIVERY_KM * 1000,
        color: '#e63946',
        fillColor: '#e63946',
        fillOpacity: 0.07,
        weight: 2,
        dashArray: '6,4',
      }).addTo(map);

      mapRef.current = map;
      setReady(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Geocode address
  useEffect(() => {
    if (!ready || !address || address.length < 5) return;

    const timeout = setTimeout(async () => {
      setGeocoding(true);
      setError('');
      try {
        const query = encodeURIComponent(`${address}, Київ, Україна`);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=ua`
        );
        const data = await res.json();

        if (!data.length) {
          setError('Адресу не знайдено. Перевірте правильність вводу.');
          setGeocoding(false);
          return;
        }

        const { lat, lon } = data[0];
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lon);
        const dist = haversineDistance(RESTAURANT_LAT, RESTAURANT_LNG, userLat, userLng);
        const cost = calcDeliveryCost(dist);

        setDistance(dist);
        onDistanceChange(dist, cost);

        import('leaflet').then((L) => {
          const map = mapRef.current;
          if (!map) return;

          if (markerRef.current) {
            markerRef.current.remove();
          }

          const userIcon = L.divIcon({
            html: `<div style="
              width:30px;height:30px;
              background:${dist <= FREE_DELIVERY_KM ? '#48c774' : '#f4a261'};
              border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              box-shadow:0 4px 15px rgba(0,0,0,0.4);
              border:3px solid white;
              font-size:14px;
            ">📍</div>`,
            className: '',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });

          markerRef.current = L.marker([userLat, userLng], { icon: userIcon })
            .addTo(map)
            .bindPopup(`<b>Ваша адреса</b><br>${data[0].display_name.split(',').slice(0, 2).join(',')}`)
            .openPopup();

          map.fitBounds([
            [RESTAURANT_LAT, RESTAURANT_LNG],
            [userLat, userLng],
          ], { padding: [60, 60] });
        });
      } catch {
        setError('Помилка геокодування. Спробуйте ще раз.');
      } finally {
        setGeocoding(false);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [address, ready, onDistanceChange]);

  const deliveryCost = distance !== null ? calcDeliveryCost(distance) : null;
  const isFree = distance !== null && distance <= FREE_DELIVERY_KM;

  return (
    <div>
      {/* Map */}
      <div style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 16 }}>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <div id="delivery-map" style={{ height: 320, width: '100%' }} />
        {geocoding && (
          <div style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(13,13,13,0.85)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 13,
            color: 'var(--text-secondary)',
            backdropFilter: 'blur(10px)',
          }}>
            🔍 Шукаємо адресу...
          </div>
        )}
      </div>

      {/* Delivery info */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          background: 'rgba(230,57,70,0.1)',
          border: '1px solid rgba(230,57,70,0.3)',
          borderRadius: 10,
          color: '#e63946',
          fontSize: 14,
          marginBottom: 12,
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {distance !== null && !error && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          padding: '16px',
          background: isFree ? 'rgba(72,199,116,0.08)' : 'rgba(244,162,97,0.08)',
          border: '1px solid',
          borderColor: isFree ? 'rgba(72,199,116,0.25)' : 'rgba(244,162,97,0.25)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <Bike size={18} style={{ color: isFree ? '#48c774' : '#f4a261' }} />
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>Відстань</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
                {distance.toFixed(1)} км
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <MapPin size={18} style={{ color: isFree ? '#48c774' : '#f4a261' }} />
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>Доставка</div>
              <div style={{
                fontWeight: 700,
                fontSize: 16,
                color: isFree ? '#48c774' : '#f4a261',
              }}>
                {isFree ? 'БЕЗКОШТОВНО 🎉' : `${deliveryCost} ₴`}
              </div>
            </div>
          </div>
          {!isFree && (
            <div style={{
              width: '100%',
              fontSize: 13,
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--border)',
              paddingTop: 10,
              marginTop: 4,
            }}>
              💡 Ви поза зоною безкоштовної доставки (1 км) або сума замовлення менша за 1000 грн. Вартість розраховується за тарифом таксі.
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
        marginTop: 12,
        padding: '10px 14px',
        background: 'var(--bg-card)',
        borderRadius: 10,
        border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(230,57,70,0.3)', border: '1px dashed #e63946' }} />
          Зона безкоштовної доставки (1 км)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <div style={{ width: 12, height: 12, borderRadius: 100, background: '#e63946' }} />
          Ресторан
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <div style={{ width: 12, height: 12, borderRadius: 100, background: '#48c774' }} />
          Ваш будинок
        </div>
      </div>
    </div>
  );
}
