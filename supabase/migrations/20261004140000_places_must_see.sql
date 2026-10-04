-- Places / Must see: seed a default tag and convert Hummanaya out of the paid catalog.

INSERT INTO categories (name, slug, category_type, sort_order)
SELECT 'Must see', 'must-see', 'place', 0
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE slug = 'must-see'
);

UPDATE activities
SET
  category_type = 'place',
  price_usd = 0,
  commission_rate = 0,
  is_custom_commission = false
WHERE slug ILIKE '%hummanaya%'
   OR title ILIKE '%hummanaya%';
