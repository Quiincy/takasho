const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Actually need service role for inserting, but anon might work if RLS allows it, wait. Let's just use the key from .env.local

require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, 'sb_publishable_LBB3RuPR6BAG2-NkcRIzmA_9GJXbvJx'); // wait, I can just use fetch.

async function run() {
  const data = [
    { key: 'fop_name', value: 'ФОП Гулак Дмитро Сергійович' },
    { key: 'fop_itn', value: '3139607532' },
    { key: 'contact_email', value: 'hello@enotsushi.com.ua' }
  ];
  
  for (const item of data) {
    const res = await fetch('https://fgwvgdvniinvprkckhri.supabase.co/rest/v1/site_settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: 'sb_publishable_LBB3RuPR6BAG2-NkcRIzmA_9GJXbvJx',
        Authorization: 'Bearer sb_publishable_LBB3RuPR6BAG2-NkcRIzmA_9GJXbvJx',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify(item)
    });
    console.log(`Inserted ${item.key}: ${res.status}`);
  }
}
run();
