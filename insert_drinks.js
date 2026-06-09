const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// We need to map the drinks to their generated image paths.
// The image paths in public/dishes:
const imageMap = {
  'Квас 0.5 ж/б': '/dishes/drink_kvas.png',
  'Пиво б/а лімон лайм ж/б 0.5': '/dishes/drink_beer_lemon.png',
  'Пиво б/а малина вишня ж/б 0.5': '/dishes/drink_beer_cherry.png',
  'Сік літр в асортименті': '/dishes/drink_juice.png',
  'Джміль 0.5': '/dishes/drink_bumblebee.png',
  'Айс лате 0.4': '/dishes/drink_ice_latte.png',
  'Матча айс лате 0.5': '/dishes/drink_matcha_latte.png',
  'Матча айс орандж 0.5': '/dishes/drink_matcha_orange.png',
  'Смузі 0.5': '/dishes/drink_smoothie.png',
  // Placeholders or missing for the rest
  'Глінтвейн 0.5': '/dishes/drink_mulled_wine.png', // we will use a generic placeholder
  'Капучіно на банановому молоці 0.4': '/dishes/drink_cappuccino.png',
  'Капучіно на кокосовому молоці 0.4': '/dishes/drink_cappuccino.png',
  'Латте на банановому молоці 0.4': '/dishes/drink_latte.png',
  'Латте на кокосовому молоці 0.4': '/dishes/drink_latte.png',
};

const drinksToInsert = [
  { name: 'Квас 0.5 ж/б', price: 35, weight: '500 мл' },
  { name: 'Пиво б/а лімон лайм ж/б 0.5', price: 40, weight: '500 мл' },
  { name: 'Пиво б/а малина вишня ж/б 0.5', price: 40, weight: '500 мл' },
  { name: 'Сік літр в асортименті', price: 100, weight: '1000 мл' },
  { name: 'Джміль 0.5', price: 80, weight: '500 мл' },
  { name: 'Айс лате 0.4', price: 80, weight: '400 мл' },
  { name: 'Матча айс лате 0.5', price: 90, weight: '500 мл' },
  { name: 'Матча айс орандж 0.5', price: 90, weight: '500 мл' },
  { name: 'Смузі 0.5', price: 100, weight: '500 мл' },
  { name: 'Глінтвейн 0.5', price: 100, weight: '500 мл' },
  { name: 'Капучіно на банановому молоці 0.4', price: 90, weight: '400 мл' },
  { name: 'Капучіно на кокосовому молоці 0.4', price: 90, weight: '400 мл' },
  { name: 'Латте на банановому молоці 0.4', price: 100, weight: '400 мл' },
  { name: 'Латте на кокосовому молоці 0.4', price: 100, weight: '400 мл' }
];

async function insertDrinks() {
  const { data: existing, error: fetchError } = await supabase
    .from('menu_items')
    .select('id, name');
    
  let sortOrderStart = 100;

  for (const drink of drinksToInsert) {
    if (existing.some(e => e.name === drink.name)) {
      console.log(`Skipping ${drink.name}, already exists.`);
      continue;
    }

    const id = 'drink-' + Date.now() + Math.floor(Math.random() * 1000);
    const item = {
      id,
      category_id: 'drinks',
      name: drink.name,
      description: '',
      price: drink.price,
      weight: drink.weight,
      image: imageMap[drink.name],
      is_available: true,
      sort_order: sortOrderStart++,
      is_popular: false
    };

    const { error: insertError } = await supabase
      .from('menu_items')
      .insert(item);

    if (insertError) {
      console.error(`Error inserting ${drink.name}:`, insertError);
    } else {
      console.log(`Inserted ${drink.name}`);
    }
  }
}

insertDrinks();
