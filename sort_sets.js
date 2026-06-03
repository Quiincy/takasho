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

async function sortSets() {
  const { data: items, error } = await supabase.from('menu_items').select('*').eq('category_id', 'sushi');
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  // Separate sets from other sushi
  const sets = items.filter(i => i.name.toLowerCase().includes('сет'));
  const others = items.filter(i => !i.name.toLowerCase().includes('сет'));
  
  // Sort sets by number in the name
  sets.sort((a, b) => {
     const numA = parseInt(a.name.match(/\d+/) ? a.name.match(/\d+/)[0] : '0');
     const numB = parseInt(b.name.match(/\d+/) ? b.name.match(/\d+/)[0] : '0');
     return numA - numB;
  });
  
  // Update sort_order for sets (10, 20, 30...)
  for (let i = 0; i < sets.length; i++) {
     await supabase.from('menu_items').update({ sort_order: (i + 1) * 10 }).eq('id', sets[i].id);
     console.log(`Updated ${sets[i].name} to sort_order ${(i + 1) * 10}`);
  }
  
  // Update sort_order for others (100, 110, 120...)
  for (let i = 0; i < others.length; i++) {
     await supabase.from('menu_items').update({ sort_order: (i + 1) * 10 + 1000 }).eq('id', others[i].id);
  }
  
  console.log('Successfully sorted all sets and sushi items!');
}

sortSets();
