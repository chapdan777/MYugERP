const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { DeleteOrderUseCase } = require('./dist/modules/orders/application/use-cases/delete-order.use-case');
const { Client } = require('pg');

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const deleteOrderUseCase = app.get(DeleteOrderUseCase);

    // Get order ID that still has work orders to test
    const client = new Client({ user: 'postgres', host: 'localhost', database: 'erp_production', password: 'postgres', port: 5432 });
    await client.connect();

    // We will test on order_id 12, since from DB it has 3 work orders remaining (ids 5,6,7) that are soft-deleted from order
    // Wait, order 12 is ALREADY soft deleted. If we try to delete it again, DeleteOrderUseCase fails with "Order with ID 12 not found" 
    // because `orderRepository.findById` does NOT load soft deleted orders by default!

    // Ah!! I see the issue. If an order were deleted successfully, but wait... let's create a NEW order and delete it.
    console.log("App loaded. This script is just to test.");
    await app.close();
}
bootstrap();
