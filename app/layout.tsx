import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });
const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  weight: ['800', '900'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Enot Sushi — Доставка суші в Києві | Суші, Піца, Бургери',
  description: 'Замовляйте суші, піцу, бургери та інші страви з безкоштовною доставкою в радіусі 5 км від ресторану Enot Sushi в Києві. Швидка доставка, онлайн оплата Monobank.',
  keywords: 'доставка їжі Київ, замовити суші Київ, піца доставка Київ, бургери доставка, Enot Sushi, ресторан Вільде, доставка Дніпровський',
  openGraph: {
    title: 'Enot Sushi — Доставка суші в Києві',
    description: 'Суші, піца, бургери з безкоштовною доставкою в радіусі 5 км. Онлайн оплата.',
    locale: 'uk_UA',
    type: 'website',
    siteName: 'Enot Sushi Delivery',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: 'https://enotsushi.com.ua',
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
    <html lang="uk" data-scroll-behavior="smooth">
      <head>
        {/* Schema.org LocalBusiness */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": "Enot Sushi",
            "image": "https://enotsushi.com.ua/hero.png",
            "description": "Ресторан доставки їжі: суші, піца, бургери в Києві",
            "url": "https://enotsushi.com.ua",
            "telephone": "+380957972943",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "вул. Едуарда Вільде, 10Б, Дніпровський район",
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
      <body className={`${inter.className} ${montserrat.variable}`}>
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-XXXXXXX');`
        }} />
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
