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

export interface DbCategory {
  id: string;
  name: string;
  emoji: string;
  sort_order: number;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_h1?: string | null;
}

export interface DbSubcategory {
  id: string;
  category_id: string;
  name: string;
  emoji: string;
  sort_order: number;
}

export interface DbMenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  weight: string;
  image: string;
  is_available: boolean;
  is_popular?: boolean;
  subcategory_ids?: string[];
}

export interface CartItem extends DbMenuItem {
  d_at: string;
}

export interface DbSiteSetting {
  key: string;
  value: string;
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

-- ========= MENU MANAGEMENT =========
create table if not exists menu_categories (
  id text primary key,
  name text not null,
  emoji text not null default '🍽️',
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists menu_items (
  id text primary key,
  category_id text references menu_categories(id) on delete cascade,
  name text not null,
  description text,
  price integer not null,
  weight text not null default '',
  image text not null default '/pizza.png',
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

alter table menu_categories enable row level security;
create policy "Anon read categories" on menu_categories for select to anon using (true);
create policy "Admin manage categories" on menu_categories for all to authenticated using (true);

alter table menu_items enable row level security;
create policy "Anon read items" on menu_items for select to anon using (true);
create policy "Admin manage items" on menu_items for all to authenticated using (true);

-- ========= SETTINGS =========
create table if not exists site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz default now()
);

alter table site_settings enable row level security;
create policy "Anon read settings" on site_settings for select to anon using (true);
create policy "Admin manage settings" on site_settings for all to authenticated using (true);

-- ========= STORAGE (menu_images) =========
-- In Supabase Dashboard:
-- 1. Create a public bucket named 'menu_images'
-- 2. Run the following SQL to enable policies:

/*
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'menu_images' );

create policy "Admin Insert"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'menu_images' );

create policy "Admin Update"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'menu_images' );

create policy "Admin Delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'menu_images' );
*/
