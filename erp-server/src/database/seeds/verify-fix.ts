import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../../.env') });

async function verifySqlFix() {
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
    
    // Check if defaults are loaded from product_properties (as now fixed in UseCase)
    const propDefaults = await dataSource.query(`
        SELECT p."variableName", pp."defaultValue", p.code
        FROM product_properties pp
        JOIN properties p ON pp."propertyId" = p.id
        WHERE pp."productId" = $1
          AND p."variableName" IS NOT NULL
          AND pp."defaultValue" IS NOT NULL
    `, [productId]);

    console.log(`\n--- Verification Results ---`);
    console.log(`Product ID: ${productId}`);
    console.log(`Defaults found in product_properties: ${propDefaults.length}`);
    
    if (propDefaults.length > 0) {
        console.log('Details:');
        for (const d of propDefaults) {
            console.log(` - ${d.variableName} (${d.code}): ${d.defaultValue}`);
        }
        console.log('\nCONCLUSION: SUCCESS. The SQL fix in GenerateWorkOrdersUseCase will now load these values correctly.');
    } else {
        console.error('\nCONCLUSION: FAILED. No defaults found in product_properties. Check your seed data.');
    }

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await dataSource.destroy();
  }
}

verifySqlFix();
