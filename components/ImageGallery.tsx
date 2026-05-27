'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  altPrefix?: string;
}

export default function ImageGallery({ images, altPrefix = 'Фото' }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 16,
        maxWidth: 800,
        margin: '0 auto'
      }}>
        {images.map((src, idx) => (
          <div 
            key={src} 
            style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 24, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', cursor: 'pointer' }}
            onClick={() => setSelectedIndex(idx)}
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
        .gallery-photo:hover {
          transform: scale(1.05);
        }
      `}</style>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}
          onClick={() => setSelectedIndex(null)}
        >
          <button 
            style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'white', cursor: 'pointer', zIndex: 2 }}
            onClick={() => setSelectedIndex(null)}
          >
            <X size={36} />
          </button>
          
          <button 
            style={{ position: 'absolute', left: '2%', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', padding: 12, zIndex: 2 }}
            onClick={prevImage}
          >
            <ChevronLeft size={32} />
          </button>

          <div style={{ position: 'relative', width: '90vw', height: '80vh', maxWidth: 1200 }} onClick={e => e.stopPropagation()}>
            <Image 
              src={images[selectedIndex]}
              alt={`${altPrefix} велике`}
              fill
              style={{ objectFit: 'contain' }}
              sizes="90vw"
              priority
            />
          </div>

          <button 
            style={{ position: 'absolute', right: '2%', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', padding: 12, zIndex: 2 }}
            onClick={nextImage}
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </>
  );
}
