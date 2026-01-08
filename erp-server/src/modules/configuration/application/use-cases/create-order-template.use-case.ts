import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { ORDER_TEMPLATE_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IOrderTemplateRepository } from '../../domain/repositories/order-template.repository.interface';
import { OrderTemplate } from '../../domain/entities/order-template.entity';

export interface CreateOrderTemplateDto {
  name: string;
  code: string;
  description?: string;
}

@Injectable()
export class CreateOrderTemplateUseCase {
  constructor(
    @Inject(ORDER_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IOrderTemplateRepository,
  ) {}

  async execute(dto: CreateOrderTemplateDto): Promise<OrderTemplate> {
    const exists = await this.templateRepository.existsByCode(dto.code);
    if (exists) {
      throw new ConflictException(`Шаблон с кодом "${dto.code}" уже существует`);
    }

    const template = OrderTemplate.create({
      name: dto.name,
      code: dto.code,
      description: dto.description ?? null,
    });

    return await this.templateRepository.save(template);
  }
}
