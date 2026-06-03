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

const drinks = [
  {
    id: 'drink-1',
    category_id: 'drinks',
    name: 'Сік в асортименті',
    price: 30,
    weight: '250 мл',
    sort_order: 10,
    is_available: true,
    image: '/drinks.png'
  },
  {
    id: 'drink-2',
    category_id: 'drinks',
    name: 'Вода газована / негазована',
    price: 30,
    weight: '500 мл',
    sort_order: 20,
    is_available: true,
    image: '/drinks.png'
  },
  {
    id: 'drink-3',
    category_id: 'drinks',
    name: 'Кола',
    price: 40,
    weight: '500 мл',
    sort_order: 30,
    is_available: true,
    image: '/drinks.png'
  },
  {
    id: 'drink-4',
    category_id: 'drinks',
    name: 'Фанта',
    price: 40,
    weight: '500 мл',
    sort_order: 40,
    is_available: true,
    image: '/drinks.png'
  },
  {
    id: 'drink-5',
    category_id: 'drinks',
    name: 'Спрайт',
    price: 40,
    weight: '500 мл',
    sort_order: 50,
    is_available: true,
    image: '/drinks.png'
  },
  {
    id: 'drink-6',
    category_id: 'drinks',
    name: 'Вино в асортименті Одеса',
    price: 50,
    weight: '500 мл',
    sort_order: 60,
    is_available: true,
    image: '/drinks.png'
  },
  {
    id: 'drink-7',
    category_id: 'drinks',
    name: 'Вино в асортименті Одеса',
    price: 70,
    weight: '1000 мл',
    sort_order: 70,
    is_available: true,
    image: '/drinks.png'
  }
];

async function updateDrinks() {
  console.log('Deleting old drinks...');
  const { error: delErr } = await supabase
    .from('menu_items')
    .delete()
    .eq('category_id', 'drinks');
    
  if (delErr) {
     console.error('Error deleting:', delErr);
     return;
  }
  
  console.log('Inserting new drinks...');
  const { error: insErr } = await supabase
    .from('menu_items')
    .insert(drinks);
    
  if (insErr) {
    console.error('Error inserting:', insErr);
  } else {
    console.log('Drinks successfully updated!');
  }
}

updateDrinks();
