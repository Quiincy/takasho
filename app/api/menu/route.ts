import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/menu — all categories + items
export async function GET() {
  const [catRes, itemRes] = await Promise.all([
    supabase.from('menu_categories').select('*').order('sort_order'),
    supabase.from('menu_items').select('*').order('sort_order'),
  ]);
  return NextResponse.json({
    categories: catRes.data ?? [],
    items: itemRes.data ?? [],
  });
}

// POST /api/menu — create category or item
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, ...data } = body;

  if (type === 'category') {
    const id = data.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_а-яіїє]/gi, '');
    const { error } = await supabase.from('menu_categories').insert({
      id: `cat_${id}_${Date.now()}`,
      name: data.name,
      emoji: data.emoji || '🍽️',
      sort_order: data.sort_order ?? 0,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (type === 'item') {
    const id = `item_${Date.now()}`;
    const { error } = await supabase.from('menu_items').insert({
      id,
      category_id: data.category_id,
      name: data.name,
      description: data.description || null,
      price: Number(data.price),
      weight: data.weight || '',
      image: data.image || '/pizza.png',
      is_available: true,
      is_popular: data.is_popular || false,
      sort_order: data.sort_order ?? 0,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
}

// PUT /api/menu — update category or item
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { type, id, ...data } = body;

  const table = type === 'category' ? 'menu_categories' : 'menu_items';
  const { error } = await supabase.from(table).update(data).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/menu — delete category or item
export async function DELETE(req: NextRequest) {
  const { type, id } = await req.json();
  const table = type === 'category' ? 'menu_categories' : 'menu_items';
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
