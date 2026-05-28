'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ImageGalleryProps {
  images: string[];
  altPrefix?: string;
}

export default function ImageGallery({ images, altPrefix = 'Фото' }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedIndex]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  };

  const modalContent = selectedIndex !== null ? (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        touchAction: 'none',
      }}
      onClick={() => setSelectedIndex(null)}
    >
      <button 
        style={{ 
          position: 'absolute', 
          top: 'max(20px, env(safe-area-inset-top))', 
          right: 'max(20px, env(safe-area-inset-right))', 
          background: 'rgba(255,255,255,0.15)', 
          border: '1px solid rgba(255,255,255,0.2)', 
          color: 'white', 
          cursor: 'pointer', 
          zIndex: 10,
          width: 44,
          height: 44,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
          transition: 'transform 0.2s ease, background 0.2s ease'
        }}
        onClick={() => setSelectedIndex(null)}
        className="modal-btn"
      >
        <X size={24} />
      </button>
      
      <button 
        style={{ 
          position: 'absolute', 
          left: 'max(10px, env(safe-area-inset-left))', 
          background: 'rgba(255,255,255,0.1)', 
          border: 'none', 
          color: 'white', 
          cursor: 'pointer', 
          borderRadius: '50%', 
          padding: 12, 
          zIndex: 10,
          backdropFilter: 'blur(4px)',
          transition: 'background 0.2s ease'
        }}
        onClick={prevImage}
        className="modal-nav-btn"
      >
        <ChevronLeft size={32} />
      </button>

      <div style={{ position: 'relative', width: '100vw', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
        <div style={{ position: 'relative', width: '90vw', height: '80dvh', maxWidth: 1200 }}>
          <Image 
            src={images[selectedIndex]}
            alt={`${altPrefix} велике`}
            fill
            style={{ objectFit: 'contain' }}
            sizes="90vw"
            priority
          />
        </div>
      </div>

      <button 
        style={{ 
          position: 'absolute', 
          right: 'max(10px, env(safe-area-inset-right))', 
          background: 'rgba(255,255,255,0.1)', 
          border: 'none', 
          color: 'white', 
          cursor: 'pointer', 
          borderRadius: '50%', 
          padding: 12, 
          zIndex: 10,
          backdropFilter: 'blur(4px)',
          transition: 'background 0.2s ease'
        }}
        onClick={nextImage}
        className="modal-nav-btn"
      >
        <ChevronRight size={32} />
      </button>
      <style>{`
        .modal-btn:hover { background: rgba(255,255,255,0.25); transform: scale(1.05); }
        .modal-nav-btn:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  ) : null;

  return (
    <>
      <div className="gallery-grid">
        {images.map((src, idx) => (
          <div 
            key={src} 
            style={{ 
              position: 'relative', 
              aspectRatio: '1/1', 
              borderRadius: 24, 
              overflow: 'hidden', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)', 
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)'
            }}
            onClick={() => setSelectedIndex(idx)}
            className="gallery-item"
          >
            <Image 
              src={src}
              alt={`${altPrefix} ${idx + 1}`}
              fill
              style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
              className="gallery-photo"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          </div>
        ))}
      </div>

      <style>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          max-width: 800px;
          margin: 0 auto;
        }
        @media (min-width: 640px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
          }
        }
        .gallery-item {
          transform: translateY(0);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .gallery-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        }
        .gallery-photo:hover {
          transform: scale(1.05);
        }
      `}</style>

      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
