const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQL(sql) {
  // Supabase REST doesn't allow raw SQL queries directly via the client easily without an RPC function.
  // Instead, since we need to modify schema, I will create a SQL file that the user can run in the Supabase SQL editor.
}

const sql = `
-- Create menu_subcategories table
CREATE TABLE IF NOT EXISTS public.menu_subcategories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id text REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  emoji text,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_subcategories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access for menu_subcategories" 
ON public.menu_subcategories FOR SELECT USING (true);

-- Allow public to insert/update/delete (since admin uses ANON_KEY for now based on current logic)
CREATE POLICY "Allow anon insert on menu_subcategories" ON public.menu_subcategories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on menu_subcategories" ON public.menu_subcategories FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on menu_subcategories" ON public.menu_subcategories FOR DELETE USING (true);

-- Add subcategory_ids column to menu_items
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS subcategory_ids text[] DEFAULT '{}';
`;

fs.writeFileSync('schema_subcategories.sql', sql);
console.log('SQL file created. It is better to apply this via Supabase SQL editor or via RPC if available.');
