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

const emojis = {
  'pizza': '🍕',
  'sushi': '🍣',
  'burgers': '🍔',
  'soups': '🍲',
  'hot appetizer': '🍟',
  'crisps': '🍗',
  'salad': '🥗',
  'drinks': '🥤',
  'deserts': '🍰'
};

async function fix() {
  for (const [id, emoji] of Object.entries(emojis)) {
     const { error } = await supabase.from('menu_categories').update({ emoji }).eq('id', id);
     if (error) {
       console.error(`Error updating ${id}:`, error);
     } else {
       console.log(`Updated ${id} with emoji ${emoji}`);
     }
  }
  console.log('All emojis fixed!');
}

fix();
