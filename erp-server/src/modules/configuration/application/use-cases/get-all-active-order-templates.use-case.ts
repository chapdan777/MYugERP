import { Injectable, Inject } from '@nestjs/common';
import { ORDER_TEMPLATE_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IOrderTemplateRepository } from '../../domain/repositories/order-template.repository.interface';
import { OrderTemplate } from '../../domain/entities/order-template.entity';

@Injectable()
export class GetAllActiveOrderTemplatesUseCase {
  constructor(
    @Inject(ORDER_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IOrderTemplateRepository,
  ) {}

  async execute(): Promise<OrderTemplate[]> {
    return await this.templateRepository.findAllActive();
  }
}
