import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';

// UseCases
import { CreatePropertyUseCase } from '../../application/use-cases/create-property.use-case';
import { GetPropertyByIdUseCase } from '../../application/use-cases/get-property-by-id.use-case';
import { GetAllActivePropertiesUseCase } from '../../application/use-cases/get-all-active-properties.use-case';
import { GetAllPropertiesUseCase } from '../../application/use-cases/get-all-properties.use-case';
import { UpdatePropertyUseCase } from '../../application/use-cases/update-property.use-case';
import { ActivatePropertyUseCase } from '../../application/use-cases/activate-property.use-case';
import { DeactivatePropertyUseCase } from '../../application/use-cases/deactivate-property.use-case';

// DTOs
import { CreatePropertyRequestDto, UpdatePropertyRequestDto, PropertyResponseDto } from '../dtos/property.dto';

@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertiesController {
  constructor(
    private readonly createPropertyUseCase: CreatePropertyUseCase,
    private readonly getPropertyByIdUseCase: GetPropertyByIdUseCase,
    private readonly getAllActivePropertiesUseCase: GetAllActivePropertiesUseCase,
    private readonly getAllPropertiesUseCase: GetAllPropertiesUseCase,
    private readonly updatePropertyUseCase: UpdatePropertyUseCase,
    private readonly activatePropertyUseCase: ActivatePropertyUseCase,
    private readonly deactivatePropertyUseCase: DeactivatePropertyUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePropertyRequestDto): Promise<PropertyResponseDto> {
    const property = await this.createPropertyUseCase.execute({
      code: dto.code,
      name: dto.name,
      dataType: dto.dataType,
      possibleValues: dto.possibleValues,
      defaultValue: dto.defaultValue,
      isRequired: dto.isRequired,
      displayOrder: dto.displayOrder,
    });

    return this.mapToResponse(property);
  }

  @Get()
  async getAll(): Promise<PropertyResponseDto[]> {
    const properties = await this.getAllActivePropertiesUseCase.execute();
    return properties.map(p => this.mapToResponse(p));
  }

  @Get('all')
  async getAllIncludingInactive(): Promise<PropertyResponseDto[]> {
    const properties = await this.getAllPropertiesUseCase.execute();
    return properties.map(p => this.mapToResponse(p));
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<PropertyResponseDto> {
    const property = await this.getPropertyByIdUseCase.execute(id);
    return this.mapToResponse(property);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePropertyRequestDto,
  ): Promise<PropertyResponseDto> {
    const property = await this.updatePropertyUseCase.execute(id, {
      name: dto.name,
      possibleValues: dto.possibleValues,
      defaultValue: dto.defaultValue,
      isRequired: dto.isRequired,
      displayOrder: dto.displayOrder,
    });

    return this.mapToResponse(property);
  }

  @Post(':id/activate')
  async activate(@Param('id', ParseIntPipe) id: number): Promise<PropertyResponseDto> {
    const property = await this.activatePropertyUseCase.execute(id);
    return this.mapToResponse(property);
  }

  @Post(':id/deactivate')
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<PropertyResponseDto> {
    const property = await this.deactivatePropertyUseCase.execute(id);
    return this.mapToResponse(property);
  }

  private mapToResponse(property: any): PropertyResponseDto {
    return {
      id: property.getId(),
      code: property.getCode(),
      name: property.getName(),
      dataType: property.getDataType(),
      possibleValues: property.getPossibleValuesArray(),
      defaultValue: property.getDefaultValue(),
      isRequired: property.getIsRequired(),
      displayOrder: property.getDisplayOrder(),
      isActive: property.getIsActive(),
      createdAt: property.getCreatedAt(),
      updatedAt: property.getUpdatedAt(),
    };
  }
}
