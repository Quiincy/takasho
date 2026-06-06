import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // LiqPay sends data as form-urlencoded `data` and `signature`
    const text = await request.text();
    const params = new URLSearchParams(text);
    const data = params.get('data');
    const signature = params.get('signature');

    if (!data || !signature) {
      return Response.json({ error: 'Missing data or signature' }, { status: 400 });
    }

    const liqpayPrivateKey = process.env.LIQPAY_PRIVATE_KEY || 'sandbox_private_key';

    // Verify signature
    const signString = liqpayPrivateKey + data + liqpayPrivateKey;
    const expectedSignature = crypto.createHash('sha1').update(signString).digest('base64');

    if (signature !== expectedSignature) {
      console.error('LiqPay invalid signature');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Decode data
    const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    const orderId = decodedData.order_id;
    const status = decodedData.status;

    // We only care about success statuses
    if (status === 'success' || status === 'wait_accept') {
      // Update order in Supabase
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'paid' }) // Update your status column as needed
        .eq('id', orderId);

      if (updateError) {
        console.error('Failed to update order status:', updateError);
      }

      // Send telegram notification about payment success
      try {
        const { data: settings } = await supabase.from('site_settings').select('*');
        if (settings) {
          const botToken = settings.find(s => s.key === 'telegram_bot_token')?.value?.trim();
          const chatId = settings.find(s => s.key === 'telegram_chat_id')?.value?.trim();
          
          if (botToken && chatId) {
            const message = `✅ <b>Замовлення #${orderId.split('-')[0]} УСПІШНО ОПЛАЧЕНО!</b>\nСума: ${decodedData.amount} ${decodedData.currency}\nЧерез LiqPay`;
            
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
              })
            });
          }
        }
      } catch (tgErr) {
        console.error('Failed to send telegram payment notification:', tgErr);
      }
    }

    return Response.json({ success: true });
  } catch (err: any) {
    console.error('LiqPay callback error:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
