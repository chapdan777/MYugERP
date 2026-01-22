-- Миграция для добавления порядка свойств в шапках
-- Добавляет поле sortOrder в таблицу property_header_items

ALTER TABLE property_header_items 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Обновляем существующие записи, устанавливая порядок по propertyId
UPDATE property_header_items 
SET sort_order = propertyId 
WHERE sort_order = 0;

-- Добавляем индекс для оптимизации сортировки
CREATE INDEX IF NOT EXISTS idx_property_header_items_sort_order 
ON property_header_items (headerId, sort_order);

-- Обновляем ограничение уникальности, включая sortOrder
ALTER TABLE property_header_items 
DROP CONSTRAINT IF EXISTS unique_header_property;

ALTER TABLE property_header_items 
ADD CONSTRAINT unique_header_property UNIQUE (headerId, propertyId, sort_order);