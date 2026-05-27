-- Цей скрипт видалить усі категорії, в яких на даний момент немає жодної страви.
-- Це прибере дублікати (старі порожні категорії), які залишилися в базі.

DELETE FROM menu_categories
WHERE id NOT IN (
  SELECT DISTINCT category_id FROM menu_items
);
