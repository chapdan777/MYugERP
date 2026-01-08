import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ORDER_TEMPLATE_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IOrderTemplateRepository } from '../../domain/repositories/order-template.repository.interface';
import { OrderTemplate } from '../../domain/entities/order-template.entity';

@Injectable()
export class GetOrderTemplateByIdUseCase {
  constructor(
    @Inject(ORDER_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IOrderTemplateRepository,
  ) {}

  async execute(id: number): Promise<OrderTemplate> {
    const template = await this.templateRepository.findById(id);
    
    if (!template) {
      throw new NotFoundException(`Шаблон заказа с ID ${id} не найден`);
    }

    return template;
  }
}
