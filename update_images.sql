-- Виконайте цей скрипт у Supabase SQL Editor, щоб масово призначити правильні картинки всім стравам!

UPDATE menu_items SET image = '/pizza.png' WHERE category_id = 'pizza';
UPDATE menu_items SET image = '/sushi.png' WHERE category_id = 'sushi';
UPDATE menu_items SET image = '/burger.png' WHERE category_id = 'burgers';
UPDATE menu_items SET image = '/shawarma.png' WHERE category_id = 'shawarma';
UPDATE menu_items SET image = '/soup.png' WHERE category_id = 'soups';
UPDATE menu_items SET image = '/hot_appetizer.png' WHERE category_id = 'hot_appetizer';
UPDATE menu_items SET image = '/snacks.png' WHERE category_id = 'crisps';
UPDATE menu_items SET image = '/beer_app.png' WHERE category_id = 'beer_app';
UPDATE menu_items SET image = '/salad.png' WHERE category_id = 'salad';
UPDATE menu_items SET image = '/drinks.png' WHERE category_id IN ('drinks', 'na_drinks');
UPDATE menu_items SET image = '/dessert.png' WHERE category_id = 'deserts';
