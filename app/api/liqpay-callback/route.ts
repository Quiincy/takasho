import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data = formData.get('data') as string;
    const signature = formData.get('signature') as string;

    if (!data || !signature) {
      return NextResponse.json({ error: 'Missing data or signature' }, { status: 400 });
    }

    const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY;
    if (!LIQPAY_PRIVATE_KEY) {
      console.error('LIQPAY_PRIVATE_KEY is not set');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHash('sha1')
      .update(LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.error('Invalid LiqPay signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Decode data
    const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    const { order_id, status, amount, currency } = decodedData;

    console.log(`LiqPay webhook received for order ${order_id}: status = ${status}`);

    // We only care about successful statuses
    // 'success' or 'wait_accept' (if the payment is successful but awaiting merchant accept)
    if (status === 'success' || status === 'wait_accept') {
      const supabase = await createClient();

      // Fetch existing order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', order_id)
        .single();

      if (orderError || !order) {
        console.error('Order not found for LiqPay callback:', order_id);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // If already marked as paid (or appended to comment), ignore
      if (order.comment && order.comment.includes('[УСПІШНО ОПЛАЧЕНО ОНЛАЙН]')) {
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      // Update order comment (and optionally status if it's supported, we use comment for notes)
      const newComment = (order.comment || '') + '\n\n✅ [УСПІШНО ОПЛАЧЕНО ОНЛАЙН] LiqPay: ' + amount + ' ' + currency;

      const { error: updateError } = await supabase
        .from('orders')
        .update({ comment: newComment })
        .eq('id', order_id);

      if (updateError) {
        console.error('Failed to update order after LiqPay success:', updateError);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
      }

      // Notify via Telegram about successful payment
      try {
        const { data: settings } = await supabase.from('site_settings').select('*');
        if (settings) {
          const botToken = settings.find(s => s.key === 'telegram_bot_token')?.value?.trim();
          const chatId = settings.find(s => s.key === 'telegram_chat_id')?.value?.trim();

          if (botToken && chatId) {
            const message = `✅ <b>Оплата успішна!</b>\nЗамовлення #${order_id.split('-')[0]} успішно оплачено через LiqPay на суму ${amount} ${currency}.`;

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
        console.error('Failed to send telegram message on liqpay success:', tgErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('LiqPay callback error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
