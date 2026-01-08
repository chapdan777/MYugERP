import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ORDER_TEMPLATE_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IOrderTemplateRepository } from '../../domain/repositories/order-template.repository.interface';
import { OrderTemplate } from '../../domain/entities/order-template.entity';
import { OrderSectionTemplate } from '../../domain/entities/order-section-template.entity';

export interface AddSectionToTemplateDto {
  sectionNumber: number;
  defaultName: string;
  description?: string;
  isRequired?: boolean;
}

@Injectable()
export class AddSectionToTemplateUseCase {
  constructor(
    @Inject(ORDER_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IOrderTemplateRepository,
  ) {}

  async execute(templateId: number, dto: AddSectionToTemplateDto): Promise<OrderTemplate> {
    const template = await this.templateRepository.findById(templateId);
    
    if (!template) {
      throw new NotFoundException(`Шаблон заказа с ID ${templateId} не найден`);
    }

    const section = OrderSectionTemplate.create({
      templateId,
      sectionNumber: dto.sectionNumber,
      defaultName: dto.defaultName,
      description: dto.description ?? null,
      isRequired: dto.isRequired ?? false,
    });

    template.addSection(section);
    return await this.templateRepository.save(template);
  }
}
