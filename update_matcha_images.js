
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDrinks() {
  const latteUrl = '/hot_matcha_latte.png';
  const orangeUrl = '/hot_matcha_orange.png';

  console.log('Latte URL:', latteUrl);
  console.log('Orange URL:', orangeUrl);

  // Fetch the items
  const { data: items, error } = await supabase
    .from('menu_items')
    .select('id, name')
    .ilike('name', '%Матча%');

  if (error) {
    console.error('Error fetching items:', error);
    return;
  }

  console.log('Found matcha items:', items.map(i => i.name));

  for (const item of items) {
    let newName = item.name.replace(/айс\s?/i, '').replace(/  +/g, ' ').trim();
    let newImage = item.image;

    if (item.name.toLowerCase().includes('лате')) {
      newImage = latteUrl;
    } else if (item.name.toLowerCase().includes('орандж') || item.name.toLowerCase().includes('орадж')) {
      newImage = orangeUrl;
    }

    if (newImage !== item.image || newName !== item.name) {
        console.log(`Updating ${item.name} -> ${newName}`);
        const { error: updateError } = await supabase
        .from('menu_items')
        .update({ name: newName, image: newImage })
        .eq('id', item.id);

        if (updateError) {
        console.error(`Error updating ${item.name}:`, updateError);
        } else {
        console.log(`Successfully updated ${newName}`);
        }
    }
  }
}

updateDrinks();
