import { Module } from '@nestjs/common';
import { PropertiesController } from './presentation/controllers/properties.controller';

@Module({
  imports: [],
  controllers: [PropertiesController],
  providers: [],
})
export class PropertiesModule {}
