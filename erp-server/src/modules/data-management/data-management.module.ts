/**
 * @file Модуль управления данными ERP системы
 * @description Модуль предоставляет централизованный API для управления основными сущностями системы:
 * пользователи, номенклатура, свойства, шапки заказов и значения свойств.
 * Реализует паттерн Clean Architecture с четким разделением слоев.
 */

import { Module } from '@nestjs/common';
import { DataManagementController } from './presentation/controllers/data-management.controller';

@Module({
  controllers: [DataManagementController],
  providers: [],
  exports: [],
})
export class DataManagementModule {}