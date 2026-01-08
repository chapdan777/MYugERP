import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { CreateOrderTemplateRequestDto, AddSectionRequestDto, OrderTemplateResponseDto, OrderSectionTemplateResponseDto } from './dtos/order-template.dto';
import { CreateOrderTemplateUseCase } from '../application/use-cases/create-order-template.use-case';
import { GetOrderTemplateByIdUseCase } from '../application/use-cases/get-order-template-by-id.use-case';
import { GetAllActiveOrderTemplatesUseCase } from '../application/use-cases/get-all-active-order-templates.use-case';
import { AddSectionToTemplateUseCase } from '../application/use-cases/add-section-to-template.use-case';
import { OrderTemplate } from '../domain/entities/order-template.entity';
import { OrderSectionTemplate } from '../domain/entities/order-section-template.entity';

@Controller('order-templates')
export class OrderTemplatesController {
  constructor(
    private readonly createOrderTemplateUseCase: CreateOrderTemplateUseCase,
    private readonly getOrderTemplateByIdUseCase: GetOrderTemplateByIdUseCase,
    private readonly getAllActiveOrderTemplatesUseCase: GetAllActiveOrderTemplatesUseCase,
    private readonly addSectionToTemplateUseCase: AddSectionToTemplateUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateOrderTemplateRequestDto): Promise<OrderTemplateResponseDto> {
    const template = await this.createOrderTemplateUseCase.execute({
      name: dto.name,
      code: dto.code,
      description: dto.description,
    });

    return this.mapToResponse(template);
  }

  @Get()
  async getAll(): Promise<OrderTemplateResponseDto[]> {
    const templates = await this.getAllActiveOrderTemplatesUseCase.execute();
    return templates.map(t => this.mapToResponse(t));
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<OrderTemplateResponseDto> {
    const template = await this.getOrderTemplateByIdUseCase.execute(id);
    return this.mapToResponse(template);
  }

  @Post(':id/sections')
  async addSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddSectionRequestDto,
  ): Promise<OrderTemplateResponseDto> {
    // Get current sections to determine next section number
    const template = await this.getOrderTemplateByIdUseCase.execute(id);
    const maxSectionNumber = template.getSections().length > 0
      ? Math.max(...template.getSections().map(s => s.getSectionNumber()))
      : -1;
    
    const updatedTemplate = await this.addSectionToTemplateUseCase.execute(id, {
      sectionNumber: maxSectionNumber + 1,
      defaultName: dto.defaultName,
      description: dto.description,
    });

    return this.mapToResponse(updatedTemplate);
  }

  private mapToResponse(template: OrderTemplate): OrderTemplateResponseDto {
    return {
      id: template.getId()!,
      name: template.getName(),
      code: template.getCode(),
      description: template.getDescription(),
      isActive: template.getIsActive(),
      sections: template.getSections().map(s => this.mapSectionToResponse(s)),
      createdAt: template.getCreatedAt(),
      updatedAt: template.getUpdatedAt(),
    };
  }

  private mapSectionToResponse(section: OrderSectionTemplate): OrderSectionTemplateResponseDto {
    return {
      id: section.getId()!,
      sectionNumber: section.getSectionNumber(),
      defaultName: section.getDefaultName(),
      description: section.getDescription(),
      isRequired: section.getIsRequired(),
      createdAt: section.getCreatedAt(),
      updatedAt: section.getUpdatedAt(),
    };
  }
}
