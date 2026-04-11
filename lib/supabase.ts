import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Client-side singleton
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Types
export type OrderStatus = 'new' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  weight: string;
}

export interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  comment: string | null;
  items: OrderItem[];
  total_price: number;
  delivery_cost: number;
  distance_km: number | null;
  status: OrderStatus;
}

export interface StopListItem {
  item_id: string;
  is_available: boolean;
  updated_at: string;
}

// ---------- SQL to run in Supabase SQL Editor ----------
/*
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  customer_name text not null,
  customer_phone text not null,
  delivery_address text not null,
  comment text,
  items jsonb not null default '[]',
  total_price integer not null default 0,
  delivery_cost integer not null default 0,
  distance_km numeric,
  status text not null default 'new'
    check (status in ('new','preparing','delivering','delivered','cancelled'))
);

create table if not exists menu_stop_list (
  item_id text primary key,
  is_available boolean not null default false,
  updated_at timestamptz default now()
);

-- Enable Realtime on orders table
alter publication supabase_realtime add table orders;

-- RLS: allow anon inserts for orders (customers)
alter table orders enable row level security;
create policy "Allow anon insert" on orders for insert to anon with check (true);
create policy "Allow anon select own" on orders for select to anon using (true);

-- Allow all for authenticated (admin)
create policy "Allow admin all" on orders for all to authenticated using (true);

-- Stop list: anon can read, authenticated can write
alter table menu_stop_list enable row level security;
create policy "Anon read stop list" on menu_stop_list for select to anon using (true);
create policy "Admin manage stop list" on menu_stop_list for all to authenticated using (true);
*/
