import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { GetOrderByIdUseCase } from './src/modules/orders/application/use-cases/get-order-by-id.use-case';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const useCase = app.get(GetOrderByIdUseCase);
    const order = await useCase.execute(15);
    console.log(JSON.stringify(order, null, 2).substring(0, 3000));
    await app.close();
}
bootstrap();
