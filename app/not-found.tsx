import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedPage from '@/components/AnimatedPage';

export default function NotFound() {
  return (
    <AnimatedPage>
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
          <h1 style={{ fontSize: 'clamp(80px, 15vw, 150px)', fontWeight: 900, color: 'var(--accent)', lineHeight: 1, marginBottom: 20 }}>404</h1>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Сторінку не знайдено</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 400, lineHeight: 1.6 }}>
            Можливо, ця сторінка була переміщена, або ви перейшли за неправильним посиланням.
          </p>
          
          <Link href="/" className="btn-primary" style={{ padding: '16px 32px', fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 10, borderRadius: 100, fontWeight: 600 }}>
            🏠 Повернутися на головну
          </Link>
        </div>

        <Footer />
      </main>
    </AnimatedPage>
  );
}
