import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Using service role key if available, otherwise anon key (since RLS allows anon insert)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('event_bookings')
      .select('event_date')
      .gte('event_date', today);

    if (error) {
      console.error('Failed to fetch booked dates:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const bookedDates = data.map(d => d.event_date);
    return NextResponse.json({ success: true, bookedDates });
  } catch (error: any) {
    console.error('Exception fetching booked dates:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventType, customerName, customerPhone, comment, eventDate, eventTime } = body;

    if (!eventType || !customerName || !customerPhone || !eventDate || !eventTime) {
      return NextResponse.json({ success: false, error: 'Заповніть всі обов\'язкові поля' }, { status: 400 });
    }

    // 1. Insert into event_bookings
    const { error: insertError } = await supabase
      .from('event_bookings')
      .insert([
        {
          event_type: eventType,
          customer_name: customerName,
          customer_phone: customerPhone,
          comment: comment || '',
          event_date: eventDate,
        }
      ]);

    if (insertError) {
      console.error('Supabase insert error for event booking:', insertError);
      if (insertError.code === '23505' || insertError.message.includes('unique constraint')) {
        return NextResponse.json({ success: false, error: 'Ця дата вже зайнята! Оберіть іншу.' }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: 'Помилка збереження в базу даних' }, { status: 500 });
    }

    // 2. Fetch telegram settings
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['telegram_bot_token', 'telegram_chat_id']);

    if (settingsError || !settings) {
      console.error('Failed to fetch telegram settings:', settingsError);
    } else {
      const botToken = settings.find((s) => s.key === 'telegram_bot_token')?.value?.trim();
      const chatId = settings.find((s) => s.key === 'telegram_chat_id')?.value?.trim();

      if (botToken && chatId) {
        // 3. Send Telegram message
        const message = `🎉 <b>Нове замовлення на організацію свята!</b>\n\n` +
          `📅 <b>Дата:</b> ${eventDate} о ${eventTime}\n` +
          `🎊 <b>Свято:</b> ${eventType}\n` +
          `👤 <b>Замовник:</b> ${customerName}\n` +
          `📞 <b>Телефон:</b> <a href="tel:${customerPhone.replace(/[^0-9+]/g, '')}">${customerPhone}</a>\n` +
          (comment ? `💬 <b>Побажання:</b> ${comment}\n` : '');

        try {
          const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: 'HTML',
            }),
          });
          if (!tgRes.ok) {
            console.error('Telegram API error:', await tgRes.text());
          }
        } catch (tgErr) {
          console.error('Exception sending telegram message:', tgErr);
        }
      } else {
        console.warn('Telegram bot token or chat ID is missing in site_settings.');
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Exception processing event order:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
