import type { Metadata, Viewport } from 'next';
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
  metadataBase: new URL('https://enotsushi.kyiv.ua'),
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
  other: {
    'google-site-verification': 'your-google-verification-code',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
      global: { fetch: (url, init) => fetch(url, { ...init, next: { revalidate: 3600 } }) }
    }
  );

  let settings: Partial<SiteSettings> = {};
  try {
    const { data } = await supabase.from('site_settings').select('*');
    if (data) {
      const phone = data.find(s => s.key === 'contact_phone')?.value;
      const address = data.find(s => s.key === 'contact_address')?.value;
      const schedule = data.find(s => s.key === 'contact_schedule')?.value;
      const workTimeStart = data.find(s => s.key === 'work_time_start')?.value;
      const workTimeEnd = data.find(s => s.key === 'work_time_end')?.value;
      const isOrderingEnabled = data.find(s => s.key === 'is_ordering_enabled')?.value;
      const gtmId = data.find(s => s.key === 'gtm_id')?.value;
      if (phone) settings.contact_phone = phone;
      if (address) settings.contact_address = address;
      if (schedule) settings.contact_schedule = schedule;
      if (workTimeStart) settings.work_time_start = workTimeStart;
      if (workTimeEnd) settings.work_time_end = workTimeEnd;
      if (isOrderingEnabled) settings.is_ordering_enabled = isOrderingEnabled !== 'false';
      if (gtmId) settings.gtm_id = gtmId;
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
            "image": "https://enotsushi.kyiv.ua/hero.png",
            "description": "Ресторан доставки їжі: суші, піца, бургери в Києві",
            "url": "https://enotsushi.kyiv.ua",
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
        {(settings.gtm_id || process.env.NEXT_PUBLIC_GTM_ID) && (
          <Script id="gtm-script" strategy="afterInteractive" dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${settings.gtm_id || process.env.NEXT_PUBLIC_GTM_ID}');`
          }} />
        )}
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
        {(settings.gtm_id || process.env.NEXT_PUBLIC_GTM_ID) && (
          <noscript>
            <iframe src={`https://www.googletagmanager.com/ns.html?id=${settings.gtm_id || process.env.NEXT_PUBLIC_GTM_ID}`}
              height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
          </noscript>
        )}
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
