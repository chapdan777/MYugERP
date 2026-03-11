import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // @ts-ignore
  const { EntityManager } = await import('typeorm');
  const em = app.get(EntityManager);

  const query = `
    SELECT p.id as product_id, p.name as product_name, p.code as product_code, p."isActive",
           pp."propertyId", prop.name as prop_name, prop.code as prop_code
    FROM products p
    LEFT JOIN product_properties pp ON pp."productId" = p.id
    LEFT JOIN properties prop ON prop.id = pp."propertyId"
    WHERE p.code = 'COMP-POP' OR p.name ILIKE '%филенка%' OR p.name ILIKE '%профиль%' OR p.name ILIKE 'Рубашка%';
  `;
  const result = await em.query(query);
  console.log(JSON.stringify(result, null, 2));

  await app.close();
}
bootstrap();
