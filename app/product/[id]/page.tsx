import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import AnimatedPage from '@/components/AnimatedPage';
import ProductView from './ProductView';
import { Metadata } from 'next';
import Footer from '@/components/Footer';

export const revalidate = 60; // ISR revalidation

interface Props {
  params: {
    id: string;
  };
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: product } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (!product) {
    return {
      title: 'Товар не знайдено | Enot Sushi',
    };
  }

  return {
    title: `${product.name} — Замовити з доставкою | Enot Sushi`,
    description: product.description || `Замовляйте ${product.name} з безкоштовною доставкою в Києві.`,
    openGraph: {
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { data: product, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <AnimatedPage>
      <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Header />
        <div className="reveal">
          <ProductView product={product} />
        </div>
        <Footer />
      </main>
    </AnimatedPage>
  );
}
