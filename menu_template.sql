-- =========================================================
-- ШАБЛОН ДЛЯ ДОДАВАННЯ МЕНЮ В SUPABASE
-- 1. Скопіюйте цей код у SQL Editor у вашому Supabase.
-- 2. Змініть дані (назви, ціни, описи) на свої.
-- 3. Натисніть "Run" для виконання запиту.
-- =========================================================

-- 1. ДОДАВАННЯ КАТЕГОРІЙ (якщо їх ще немає в базі)
-- id: унікальний ідентифікатор латиницею (наприклад, 'pizza')
-- name: назва категорії, яка буде відображатись на сайті
-- emoji: іконка
-- sort_order: порядок відображення (менше число - вище в списку)
INSERT INTO menu_categories (id, name, emoji, sort_order) 
VALUES 
  ('pizza', 'Піца Італійська', '🍕', 10),
  ('sushi', 'Суші', '🍣', 20),
  ('burgers', 'Бургери', '🍔', 30),
  ('shawarma', 'Шаурма', '🌯', 40),
  ('drinks', 'Напої', '🥤', 50)
ON CONFLICT (id) DO NOTHING;

-- 2. ДОДАВАННЯ СТРАВ
-- id: унікальний ідентифікатор страви (наприклад, 'pizza-margarita')
-- category_id: повинен збігатись із id категорії з попереднього кроку
-- price: ціна у гривнях (просто ціле число, без слова "грн")
INSERT INTO menu_items (id, category_id, name, description, price, weight, image, is_available, sort_order)
VALUES 
  -- ПІЦА
  ('pizza-margarita', 'pizza', 'Маргарита', 'Помідори, моцарелла, пармезан, часник, орегано, томатний соус', 140, '500 г', '/pizza.png', true, 10),
  ('pizza-pepperoni', 'pizza', 'Папероні', 'Салямі, моцарелла, пармезан, часник, орегано, томатний соус', 170, '550 г', '/pizza.png', true, 20),
  
  -- СУШІ
  ('sushi-philadelphia', 'sushi', 'Філадельфія', 'Лосось, норі, рис, крем сир, васабі, імбир, соєвий соус', 250, '300 г', '/sushi.png', true, 10),
  ('sushi-california', 'sushi', 'Каліфорнія', 'Лосось, норі, рис, ікра тобіко, крем сир, огірок', 270, '250 г', '/sushi.png', true, 20),

  -- БУРГЕРИ
  ('burger-beef', 'burgers', 'Бургер Яловичина', 'Котлета з яловичини, салат айсберг, помідор, бекон, сир чеддер, соус, булочка бріош', 180, '400 г', '/burger.png', true, 10),

  -- ШАУРМА
  ('shawarma-classic', 'shawarma', 'Шаурма класична', 'Лаваш, курка, капуста, соус часниковий', 120, '400 г', '/shawarma.png', true, 10)

  -- Додавайте нові рядки тут за таким самим принципом...

ON CONFLICT (id) DO UPDATE 
SET 
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  weight = EXCLUDED.weight,
  image = EXCLUDED.image,
  is_available = EXCLUDED.is_available,
  sort_order = EXCLUDED.sort_order;
