import { supabase } from '@/lib/supabase';
import { NextRequest } from 'next/server';
import { OrderStatus } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/orders/[id]'>
) {
  try {
    const { id } = await ctx.params;
    const { status } = await request.json() as { status: OrderStatus };

    const validStatuses: OrderStatus[] = ['new', 'preparing', 'delivering', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return Response.json({ error: 'Невірний статус' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return Response.json({ success: true, order: data });
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Помилка' }, { status: 500 });
  }
}
