import { supabase } from '@/lib/supabase';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { customer_name, customer_phone, delivery_address, comment, items, total_price, delivery_cost, distance_km } = body;

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

    return Response.json({ success: true, order: data }, { status: 201 });
  } catch (err: any) {
    console.error('Order creation error:', err);
    return Response.json({ error: err?.message ?? 'Помилка сервера' }, { status: 500 });
  }
}
