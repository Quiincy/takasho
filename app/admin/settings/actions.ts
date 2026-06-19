'use server';

import { createClient } from '@/utils/supabase/server';

export async function loadSettingsAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('site_settings').select('*');

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') {
        return { error: 'TABLE_MISSING' };
      }
      throw error;
    }

    return { data };
  } catch (error: any) {
    return { error: error.message || 'Unknown error' };
  }
}

export async function saveSettingsAction(updates: any[]) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('site_settings').upsert(updates);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Unknown error' };
  }
}

export async function testTelegramBotAction(botToken: string, chatId: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: '✅ Це тестове повідомлення з адмін-панелі Enot Sushi!\nІнтеграція працює чудово.',
        parse_mode: 'HTML'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.description || 'Помилка відправки в Telegram');
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Unknown error' };
  }
}
