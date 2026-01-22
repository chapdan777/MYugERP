-- Migration for Property Headers module
-- Creates tables for property headers and header items

-- Create property_headers table
CREATE TABLE IF NOT EXISTS property_headers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    order_type_id INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create property_header_items table
CREATE TABLE IF NOT EXISTS property_header_items (
    header_id INTEGER NOT NULL,
    property_id INTEGER NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (header_id, property_id),
    FOREIGN KEY (header_id) REFERENCES property_headers(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_headers_order_type_id ON property_headers(order_type_id);
CREATE INDEX IF NOT EXISTS idx_property_headers_is_active ON property_headers(is_active);
CREATE INDEX IF NOT EXISTS idx_property_headers_name ON property_headers(name);

CREATE INDEX IF NOT EXISTS idx_property_header_items_property_id ON property_header_items(property_id);

-- Add comments for documentation
COMMENT ON TABLE property_headers IS 'Шапки свойств для группировки часто используемых комбинаций свойств';
COMMENT ON COLUMN property_headers.name IS 'Название шапки';
COMMENT ON COLUMN property_headers.order_type_id IS 'ID типа заказа, к которому применяется шапка';
COMMENT ON COLUMN property_headers.description IS 'Описание шапки';
COMMENT ON COLUMN property_headers.is_active IS 'Флаг активности шапки';

COMMENT ON TABLE property_header_items IS 'Элементы шапок свойств';
COMMENT ON COLUMN property_header_items.header_id IS 'ID шапки';
COMMENT ON COLUMN property_header_items.property_id IS 'ID свойства';
COMMENT ON COLUMN property_header_items.value IS 'Значение свойства в шапке';