const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { GenerateWorkOrdersUseCase } = require('./dist/modules/work-orders/application/use-cases/generate-work-orders.use-case');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const useCase = app.get(GenerateWorkOrdersUseCase);
  
  try {
    const orders = await useCase.execute(37, true);
    console.log('Work orders generated successfully');
    for (const wo of orders) {
      console.log(`\nWork Order: ${wo.getWorkOrderNumber()} (${wo.getOperationName()})`);
      for (const item of wo.getItems()) {
        console.log(`  Item: ${item.getProductName()}`);
        const mats = item.getCalculatedMaterials();
        console.log('  Components:');
        for (const c of mats.components || []) {
            console.log(`   - ${c.name} (${c.length}x${c.width}x${c.depth}) qty: ${c.quantity}`);
        }
      }
    }
  } catch(e) {
      console.error(e);
  }
  
  await app.close();
}
bootstrap();
