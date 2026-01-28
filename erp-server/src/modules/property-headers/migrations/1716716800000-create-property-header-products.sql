CREATE TABLE property_header_products (
  header_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_property_header_products PRIMARY KEY (header_id, product_id),
  CONSTRAINT fk_php_header FOREIGN KEY (header_id) REFERENCES property_headers (id) ON DELETE CASCADE,
  CONSTRAINT fk_php_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

CREATE INDEX idx_php_header_id ON property_header_products (header_id);
CREATE INDEX idx_php_product_id ON property_header_products (product_id);
