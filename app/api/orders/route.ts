import { createClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

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

    // Telegram notification
    try {
      const { data: settings } = await supabase.from('site_settings').select('*');
      if (settings) {
        const botToken = settings.find(s => s.key === 'telegram_bot_token')?.value?.trim();
        const chatId = settings.find(s => s.key === 'telegram_chat_id')?.value?.trim();
        
        if (botToken && chatId) {
          const escapeHtml = (text: string) => text ? text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
          
          const itemsList = items.map((item: any) => `• ${escapeHtml(item.name)} x${item.quantity} — ${item.price * item.quantity} ₴`).join('\n');
          const message = `
🟢 <b>Нове замовлення #${data.id.split('-')[0]}</b>

👤 <b>Клієнт:</b> ${escapeHtml(customer_name)}
📞 <b>Телефон:</b> ${escapeHtml(customer_phone)}
📍 <b>Адреса:</b> ${escapeHtml(delivery_address)}

📝 <b>Деталі замовлення:</b>
${escapeHtml(comment || 'Немає додаткових деталей')}
${payment_method === 'liqpay' ? '\n⏳ <b>Оплата:</b> Очікує онлайн-оплату (LiqPay)' : ''}

🛒 <b>Кошик:</b>
${itemsList}

💰 <b>Товари:</b> ${total_price} ₴
🛵 <b>Доставка:</b> ${delivery_cost} ₴
💵 <b>Разом:</b> ${total_price + delivery_cost} ₴
          `.trim();

          const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: 'HTML'
            })
          });
          
          if (!res.ok) {
            const errorText = await res.text();
            console.error('Telegram API error:', res.status, errorText);
          }
        }
      }
    } catch (telegramErr) {
      console.error('Failed to process telegram notification:', telegramErr);
    }

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
