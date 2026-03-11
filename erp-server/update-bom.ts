import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // @ts-ignore
  const { EntityManager } = await import('typeorm');
  const em = app.get(EntityManager);
  
  // Update BOM to point to correct COMP-POP (ID 30) instead of old COMP-POP (ID 24)
  const result = await em.query(`UPDATE product_component_schemas SET child_product_id = 30 WHERE child_product_id = 24;`);
  console.log("Update BOM result:", result);

  await app.close();
}
bootstrap();
