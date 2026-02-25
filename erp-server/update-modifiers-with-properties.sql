-- Обновить модификаторы, добавив propertyId и propertyValue из связанных property_values
UPDATE price_modifiers pm
SET 
  property_id = pv.property_id,
  property_value = pv.value,
  updated_at = NOW()
FROM property_values pv
WHERE pm.id = pv.price_modifier_id
  AND pm.property_id IS NULL; -- Обновить только те, у которых еще нет propertyId

-- Проверить результат
SELECT 
  pm.id,
  pm.name,
  pm.code,
  pm.property_id,
  pm.property_value,
  p.name as property_name
FROM price_modifiers pm
LEFT JOIN property_values pv ON pm.id = pv.price_modifier_id
LEFT JOIN properties p ON pm.property_id = p.id
WHERE pm.property_id IS NOT NULL
ORDER BY pm.id;
