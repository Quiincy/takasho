'use client';

export default function ContactMap() {
  return (
    <div style={{ height: 420, width: '100%', position: 'relative' }}>
      <iframe
        src="https://maps.google.com/maps?q=ЄНОТ+КАВА,+вулиця+Едуарда+Вільде,+10+б,+Київ&t=&z=16&ie=UTF8&iwloc=&output=embed"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
      
      {/* Optional dark mode overlay to blend with the website's dark theme better */}
      <style>{`
        iframe {
          filter: invert(90%) hue-rotate(180deg) brightness(110%) contrast(90%);
        }
      `}</style>
    </div>
  );
}
