import { createClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data: settingsData } = await supabase.from('site_settings').select('*');
    if (settingsData) {
      const isOrderingEnabled = settingsData.find((s: any) => s.key === 'is_ordering_enabled')?.value;
      if (isOrderingEnabled === 'false') {
        return Response.json({ error: 'Прийом замовлень наразі призупинено.' }, { status: 400 });
      }
    }

    const { customer_name, customer_phone, delivery_address, comment, items, total_price, delivery_cost, distance_km, payment_method } = body;

    if (!customer_name || !customer_phone || !delivery_address || !items?.length) {
      return Response.json({ error: 'Заповніть всі обов\'язкові поля' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        customer_name,
        customer_phone,
        delivery_address,
        comment: comment || null,
        items,
        total_price,
        delivery_cost: delivery_cost ?? 0,
        distance_km: distance_km ?? null,
        status: 'new',
      }])
      .select()
      .single();

    if (error) throw error;

    // Telegram notification moved to LiqPay callback

    let liqpayData = null;
    if (payment_method === 'liqpay') {
      const LIQPAY_PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY;
      const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY;
      
      if (LIQPAY_PUBLIC_KEY && LIQPAY_PRIVATE_KEY) {
        const host = request.headers.get('host') || 'enotsushi.kyiv.ua';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;
        
        const jsonString = JSON.stringify({
          public_key: LIQPAY_PUBLIC_KEY,
          version: '3',
          action: 'pay',
          amount: total_price + (delivery_cost ?? 0),
          currency: 'UAH',
          description: `Оплата замовлення Enot Sushi #${data.id.split('-')[0]}`,
          order_id: data.id,
          result_url: `${baseUrl}/cart?payment=success`,
          server_url: `${baseUrl}/api/liqpay-callback`,
        });
        
        const dataBase64 = Buffer.from(jsonString).toString('base64');
        const signature = crypto.createHash('sha1').update(LIQPAY_PRIVATE_KEY + dataBase64 + LIQPAY_PRIVATE_KEY).digest('base64');
        
        liqpayData = {
          data: dataBase64,
          signature
        };
      } else {
        console.warn('LiqPay keys are not configured');
      }
    }

    return Response.json({ success: true, order: data, liqpay: liqpayData }, { status: 201 });
  } catch (err: any) {
    console.error('Order creation error:', err);
    return Response.json({ error: err?.message ?? 'Помилка сервера' }, { status: 500 });
  }
}
