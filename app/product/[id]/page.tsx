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
    description: product.description || `Замовляйте ${product.name} з доставкою в Києві.`,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: product.name,
            image: [product.image],
            description: product.description || `Замовляйте ${product.name} з доставкою в Києві.`,
            sku: product.id,
            offers: {
              '@type': 'Offer',
              url: `https://enotsushi.kyiv.ua/product/${product.id}`,
              priceCurrency: 'UAH',
              price: product.price,
              availability: 'https://schema.org/InStock',
              seller: {
                '@type': 'Organization',
                name: 'Enot Sushi',
              },
            },
          }),
        }}
      />
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
