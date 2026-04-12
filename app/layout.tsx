import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Так а Шо — Доставка їжі в Києві | Суші, Піца, Бургери',
  description: 'Замовляйте суші, піцу, бургери та інші страви з безкоштовною доставкою в радіусі 5 км від ресторану Так а Шо в Києві. Швидка доставка, онлайн оплата Monobank.',
  keywords: 'доставка їжі Київ, замовити суші Київ, піца доставка Київ, бургери доставка, Так а Шо, ресторан Вільде, доставка Деснянський',
  openGraph: {
    title: 'Так а Шо — Доставка їжі в Києві',
    description: 'Суші, піца, бургери з безкоштовною доставкою в радіусі 5 км. Онлайн оплата.',
    locale: 'uk_UA',
    type: 'website',
    siteName: 'Так а Шо Delivery',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: 'https://takasho.com.ua',
  },
  other: {
    'google-site-verification': 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <head>
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-XXXXXXX');`
        }} />
        {/* Schema.org LocalBusiness */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": "Так а Шо",
            "image": "https://takasho.com.ua/hero.png",
            "description": "Ресторан доставки їжі: суші, піца, бургери в Києві",
            "url": "https://takasho.com.ua",
            "telephone": "+380957972943",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "вул. Едуарда Вільде, 10Б",
              "addressLocality": "Київ",
              "addressCountry": "UA"
            },
            "servesCuisine": ["Japanese", "Italian", "American"],
            "priceRange": "₴₴",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Меню доставки"
            }
          })
        }} />
      </head>
      <body className={inter.className}>
        {/* GTM noscript */}
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
            height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
        </noscript>
        <div style={{ overflowX: 'hidden', width: '100%', minHeight: '100vh' }}>
          <CartProvider>
            {children}
          </CartProvider>
        </div>
      </body>
    </html>
  );
}
