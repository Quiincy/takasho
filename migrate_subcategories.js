const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const sushiSubs = [
  { name: 'Всі роли', emoji: '🍣', local_id: 'rolls' },
  { name: 'Сети', emoji: '🍱', local_id: 'sets' },
  { name: 'Філадельфія', emoji: '🧀', local_id: 'phila' },
  { name: 'Каліфорнія', emoji: '🦀', local_id: 'cali' },
  { name: 'Суші шаурма', emoji: '🌯', local_id: 'shawarma' },
  { name: 'Суші бургери', emoji: '🍔', local_id: 'burgers' },
  { name: 'Роли від шефа', emoji: '👨‍🍳', local_id: 'chef' },
  { name: 'Макі', emoji: '🥒', local_id: 'maki' },
  { name: 'Нігірі', emoji: '🍣', local_id: 'nigiri' },
];

const drinkSubs = [
  { name: 'Холодні напої', emoji: '🧊', local_id: 'cold_drinks' },
  { name: 'Вода', emoji: '💧', local_id: 'water' },
  { name: 'Солодка вода', emoji: '🥤', local_id: 'soda' },
  { name: 'Соки', emoji: '🧃', local_id: 'juice' },
  { name: 'Кава', emoji: '☕', local_id: 'coffee' },
  { name: 'Чай', emoji: '🍵', local_id: 'tea' },
  { name: 'Коктейлі', emoji: '🍹', local_id: 'cocktails' },
  { name: 'Вино', emoji: '🍷', local_id: 'wine' },
];

async function migrate() {
  console.log('Starting migration...');

  // 1. Fetch categories
  const { data: categories } = await supabase.from('menu_categories').select('id, name');
  const sushiCat = categories.find(c => c.id === 'sushi');
  const drinksCat = categories.find(c => c.id === 'drinks');

  const createdSubsMap = {}; // local_id -> db_uuid

  // 2. Insert Sushi Subcategories
  if (sushiCat) {
    for (let i = 0; i < sushiSubs.length; i++) {
      const sub = sushiSubs[i];
      const { data, error } = await supabase.from('menu_subcategories').insert({
        category_id: sushiCat.id,
        name: sub.name,
        emoji: sub.emoji,
        sort_order: i
      }).select().single();
      if (error) console.error(error);
      if (data) createdSubsMap[sub.local_id] = data.id;
    }
  }

  // 3. Insert Drink Subcategories
  if (drinksCat) {
    for (let i = 0; i < drinkSubs.length; i++) {
      const sub = drinkSubs[i];
      const { data, error } = await supabase.from('menu_subcategories').insert({
        category_id: drinksCat.id,
        name: sub.name,
        emoji: sub.emoji,
        sort_order: i
      }).select().single();
      if (error) console.error(error);
      if (data) createdSubsMap[sub.local_id] = data.id;
    }
  }

  console.log('Subcategories created.');

  // 4. Fetch all items
  const { data: items } = await supabase.from('menu_items').select('id, name, category_id');

  // 5. Update items with subcategory_ids
  for (const item of items) {
    const name = item.name.toLowerCase();
    let subIds = [];

    if (item.category_id === 'sushi') {
      const isSet = name.includes('сет');
      const isPhila = name.includes('філадельфія');
      const isCali = name.includes('каліфорнія');
      const isShawarma = name.includes('шаурма');
      const isBurger = name.includes('бургер');
      const isMaki = name.includes('макі');
      const isNigiri = name.includes('нігірі');
      const isChef = !isSet && !isPhila && !isCali && !isShawarma && !isBurger && !isMaki && !isNigiri;

      if (isSet) subIds.push(createdSubsMap['sets']);
      if (!isSet) subIds.push(createdSubsMap['rolls']);
      if (isPhila) subIds.push(createdSubsMap['phila']);
      if (isCali) subIds.push(createdSubsMap['cali']);
      if (isShawarma) subIds.push(createdSubsMap['shawarma']);
      if (isBurger) subIds.push(createdSubsMap['burgers']);
      if (isChef) subIds.push(createdSubsMap['chef']);
      if (isMaki) subIds.push(createdSubsMap['maki']);
      if (isNigiri) subIds.push(createdSubsMap['nigiri']);
    } 
    else if (item.category_id === 'drinks') {
      const isWater = name.includes('вода') || name.includes('bonaqua');
      const isSoda = name.includes('кока-кола') || name.includes('фанта') || name.includes('спрайт') || name.includes('швепс') || name.includes('coca') || name.includes('cola') || (name.includes('кола') && !name.includes('шоколад') && !name.includes('колада'));
      const isJuice = name.includes('сік') || name.includes('rich') || name.includes('садочок');
      const isCoffee = name.includes('кава') || name.includes('еспресо') || name.includes('американо') || name.includes('капучіно') || name.includes('латте') || name.includes('лате') || name.includes('флет уайт') || name.includes('какао') || name.includes('шоколад') || name.includes('джміль');
      const isTea = name.includes('чай') || name.includes('матча');
      const isWine = name.includes('вино');
      const isCocktail = name.includes('коктейль') || name.includes('коктель') || name.includes('мохіто') || name.includes('сангрія') || name.includes('піна колада') || name.includes('bubble tea');
      const isColdDrink = name.includes('квас') || name.includes('пиво') || name.includes('джміль') || name.includes('айс') || name.includes('смузі') || name.includes('лимонад') || isCocktail;

      if (isWater && !isSoda) subIds.push(createdSubsMap['water']);
      if (isSoda) subIds.push(createdSubsMap['soda']);
      if (isJuice) subIds.push(createdSubsMap['juice']);
      if (isCoffee) subIds.push(createdSubsMap['coffee']);
      if (isTea) subIds.push(createdSubsMap['tea']);
      if (isWine) subIds.push(createdSubsMap['wine']);
      if (isCocktail) subIds.push(createdSubsMap['cocktails']);
      if (isColdDrink) subIds.push(createdSubsMap['cold_drinks']);
    }

    subIds = subIds.filter(Boolean); // remove undefined just in case

    if (subIds.length > 0) {
      const { error } = await supabase.from('menu_items')
        .update({ subcategory_ids: subIds })
        .eq('id', item.id);
      if (error) console.error(`Failed to update ${item.name}:`, error);
    }
  }

  console.log('Migration completed successfully!');
}

migrate();
