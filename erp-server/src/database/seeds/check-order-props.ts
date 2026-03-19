import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../../.env') });

async function checkOrderProps() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [],
    logging: false,
  });

  try {
    await dataSource.initialize();

    // Get latest order item
    const lastItems = await dataSource.query(`
      SELECT oi.id, oi."productId", oi.width, oi.length, oi.depth, oi.quantity, o."orderNumber", o.id as "orderId"
      FROM order_items oi
      JOIN orders o ON oi."orderId" = o.id
      ORDER BY oi.id DESC
      LIMIT 1
    `);

    if (lastItems.length === 0) {
      console.log('No order items found.');
      return;
    }

    const item = lastItems[0];
    console.log(`Checking Item ID: ${item.id}, Product ID: ${item.productId}, Order: ${item.orderNumber}`);

    // Check property_in_order
    const props = await dataSource.query(`
      SELECT pio.*, p.name as "propName", p."variableName"
      FROM property_in_order pio
      JOIN properties p ON pio."propertyCode" = p.code
      WHERE pio."orderItemId" = $1
    `, [item.id]);

    console.log(`Properties for this item in Order (${props.length}):`);
    for (const p of props) {
      console.log(` - Code: ${p.propertyCode}, Name: ${p.propName}, Value: ${p.value}, varName: ${p.variableName}`);
    }

    // Check defaults that WOULD be loaded by the current GenerateWorkOrdersUseCase
    const currentDefaults = await dataSource.query(`
        SELECT p."variableName", p."defaultValue", p.code
        FROM product_properties pp
        JOIN properties p ON pp."propertyId" = p.id
        WHERE pp."productId" = $1
          AND p."variableName" IS NOT NULL
          AND p."defaultValue" IS NOT NULL
    `, [item.productId]);

    console.log(`\nDefaults currently loaded by UseCase (${currentDefaults.length}):`);
    for (const d of currentDefaults) {
      console.log(` - var: ${d.variableName}, val: ${d.defaultValue}`);
    }

    // Check defaults that SHOULD be loaded
    const betterDefaults = await dataSource.query(`
        SELECT p."variableName", pp."defaultValue", p.code
        FROM product_properties pp
        JOIN properties p ON pp."propertyId" = p.id
        WHERE pp."productId" = $1
          AND p."variableName" IS NOT NULL
          AND pp."defaultValue" IS NOT NULL
    `, [item.productId]);

    console.log(`\nDefaults that SHOULD be loaded (${betterDefaults.length}):`);
    for (const d of betterDefaults) {
      console.log(` - var: ${d.variableName}, val: ${d.defaultValue}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

checkOrderProps();
