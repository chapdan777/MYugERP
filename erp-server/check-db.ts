import { DataSource } from 'typeorm';
import { typeOrmConfig } from './src/common/config/typeorm.config';

async function check() {
  const ds = new DataSource(typeOrmConfig);
  await ds.initialize();
  
  const trColumns = await ds.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'technological_routes'`);
  console.log('technological_routes columns:', trColumns.map(c => c.column_name).join(', '));
  
  const pColumns = await ds.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'products'`);
  console.log('products columns:', pColumns.map(c => c.column_name).join(', '));
  
  await ds.destroy();
}

check().catch(console.error);
