'use client';

import { useEffect, useRef } from 'react';

const RESTAURANT_LAT = 50.5102;
const RESTAURANT_LNG = 30.6368;

export default function ContactMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!containerRef.current) return;
    if (mapRef.current) return; // already initialized

    import('leaflet').then((L) => {
      // Guard again in case of concurrent calls
      if (mapRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current!, {
        center: [RESTAURANT_LAT, RESTAURANT_LNG],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom restaurant marker
      const restIcon = L.divIcon({
        html: `<div style="
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #e63946, #c1121f);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 20px rgba(230,57,70,0.55);
          border: 2px solid white;
        "><span style="transform: rotate(45deg); font-size: 20px; line-height: 1;">🍣</span></div>`,
        className: '',
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -48],
      });

      L.marker([RESTAURANT_LAT, RESTAURANT_LNG], { icon: restIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: Inter, sans-serif; padding: 4px 2px;">
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px;">🍣 Enot Sushi</div>
            <div style="font-size: 12px; color: #888;">вул. Едуарда Вільде, 10Б</div>
            <div style="font-size: 12px; color: #888;">Пн–Нд: 11:00 – 23:00</div>
          </div>
        `)
        .openPopup();

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div
        ref={containerRef}
        style={{ height: 420, width: '100%' }}
      />
    </>
  );
}
