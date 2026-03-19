import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../../.env') });

async function checkPropsVName() {
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

    const productId = 5;

    const props = await dataSource.query(`
      SELECT p.id, p.name, p."variableName", p.code
      FROM properties p
      JOIN product_properties pp ON p.id = pp."propertyId"
      WHERE pp."productId" = $1
    `, [productId]);

    console.log(`Properties for Product ${productId}:`);
    for (const p of props) {
      console.log(` - ID ${p.id}: ${p.name}, varName="${p.variableName}", code="${p.code}"`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

checkPropsVName();
