const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8').split('\n');
env.forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getBatch() {
  const { data: items } = await supabase.from('menu_items')
    .select('*')
    .not('image', 'ilike', '/dishes/%')
    .order('category_id')
    .limit(15); // Fetch 15 items!

  if (items.length === 0) {
    console.log('ALL ITEMS PROCESSED!');
    return;
  }

  console.log(JSON.stringify(items.map(i => ({
    id: i.id,
    category: i.category_id,
    name: i.name,
    desc: i.description
  })), null, 2));
}

getBatch();
