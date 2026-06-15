import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import { SiteSettingsProvider, SiteSettings } from '@/lib/settings-context';
import { createClient } from '@supabase/supabase-js';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });
const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  weight: ['800', '900'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://enot-six.vercel.app'),
  title: 'Enot Sushi — Доставка суші в Києві | Суші, Піца, Бургери',
  description: 'Замовляйте найсмачніші суші, піцу, бургери та інші страви. Швидка доставка, приємні ціни та зручна онлайн оплата.',
  keywords: 'доставка їжі Київ, замовити суші Київ, піца доставка Київ, бургери доставка, Enot Sushi, ресторан Вільде, доставка Дніпровський',
  openGraph: {
    title: 'Enot Sushi — Доставка суші в Києві',
    description: 'Найсмачніші суші, піца та бургери. Швидка доставка та онлайн оплата.',
    locale: 'uk_UA',
    type: 'website',
    siteName: 'Enot Sushi Delivery',
    images: [
      {
        url: '/logo.png',
        width: 1024,
        height: 1024,
        alt: 'Enot Sushi Logo',
      },
    ],
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient(
    (process.env['NEXT_PUBLIC_SUPABASE_URL'] || 'https://placeholder.supabase.co'),
    (process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || 'placeholder'),
    {
      global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) }
    }
  );

  let settings: Partial<SiteSettings> = {};
  try {
    const { data } = await supabase.from('site_settings').select('*');
    if (data) {
      const phone = data.find(s => s.key === 'contact_phone')?.value;
      const address = data.find(s => s.key === 'contact_address')?.value;
      const schedule = data.find(s => s.key === 'contact_schedule')?.value;
      if (phone) settings.contact_phone = phone;
      if (address) settings.contact_address = address;
      if (schedule) settings.contact_schedule = schedule;
    }
  } catch (e) {
    console.error("Failed to load settings in layout", e);
  }

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
        {/* Google Tag Manager (Disabled until real ID is provided)
        <Script id="gtm-script" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-XXXXXXX');`
        }} />
        */}
        {/* Next.js Dev Indicator Fix */}
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              localStorage.removeItem('__next_hide_dev_indicator__');
              localStorage.removeItem('__next_build_indicator__');
              sessionStorage.removeItem('__next_hide_dev_indicator__');
            } catch(e) {}
          `
        }} />
        {/* GTM noscript
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
            height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
        </noscript>
        */}
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <SiteSettingsProvider settings={settings}>
            <CartProvider>
              {children}
            </CartProvider>
          </SiteSettingsProvider>
        </div>
      </body>
    </html>
  );
}
