import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../../.env') });

async function checkLastWorkOrderItems() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [], // We'll use raw queries
    logging: false,
  });

  try {
    await dataSource.initialize();

    // Find latest Work Order
    const lastWO = await dataSource.query(`
      SELECT id, "work_order_number", "operation_name", "department_name", "order_id"
      FROM work_orders
      ORDER BY "created_at" DESC
      LIMIT 1
    `);

    if (lastWO.length === 0) {
      console.log('No work orders found.');
      return;
    }

    console.log(`Checking latest Work Order: ${lastWO[0].work_order_number} (${lastWO[0].operation_name}), Order ID: ${lastWO[0].order_id}`);

    // Find items for this Work Order
    const items = await dataSource.query(`
      SELECT id, "product_name", "product_id", "calculated_materials"
      FROM work_order_items
      WHERE "work_order_id" = $1
    `, [lastWO[0].id]);

    for (const item of items) {
      console.log(`--- Item: ${item.product_name} (ID: ${item.product_id}) ---`);
      console.log('Calculated Materials:', JSON.stringify(item.calculated_materials, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

checkLastWorkOrderItems();
