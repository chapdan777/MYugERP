import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePropertyHeaderUseCase } from '../../application/use-cases/create-property-header.use-case';
import { GetPropertyHeaderByIdUseCase } from '../../application/use-cases/get-property-header-by-id.use-case';
import { GetAllPropertyHeadersUseCase } from '../../application/use-cases/get-all-property-headers.use-case';
import { UpdatePropertyHeaderUseCase } from '../../application/use-cases/update-property-header.use-case';
import { ActivatePropertyHeaderUseCase } from '../../application/use-cases/activate-property-header.use-case';
import { DeactivatePropertyHeaderUseCase } from '../../application/use-cases/deactivate-property-header.use-case';
import { DeletePropertyHeaderUseCase } from '../../application/use-cases/delete-property-header.use-case';
import { CreatePropertyHeaderDto } from '../../application/dto/create-property-header.dto';
import { UpdatePropertyHeaderDto } from '../../application/dto/update-property-header.dto';

@ApiTags('property-headers')
@Controller('property-headers')
export class PropertyHeadersController {
  constructor(
    private readonly createPropertyHeaderUseCase: CreatePropertyHeaderUseCase,
    private readonly getPropertyHeaderByIdUseCase: GetPropertyHeaderByIdUseCase,
    private readonly getAllPropertyHeadersUseCase: GetAllPropertyHeadersUseCase,
    private readonly updatePropertyHeaderUseCase: UpdatePropertyHeaderUseCase,
    private readonly activatePropertyHeaderUseCase: ActivatePropertyHeaderUseCase,
    private readonly deactivatePropertyHeaderUseCase: DeactivatePropertyHeaderUseCase,
    private readonly deletePropertyHeaderUseCase: DeletePropertyHeaderUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую шапку свойств' })
  @ApiResponse({ status: 201, description: 'Шапка успешно создана' })
  async create(@Body() dto: CreatePropertyHeaderDto) {
    return await this.createPropertyHeaderUseCase.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить шапку по ID' })
  @ApiResponse({ status: 200, description: 'Шапка найдена' })
  @ApiResponse({ status: 404, description: 'Шапка не найдена' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    const header = await this.getPropertyHeaderByIdUseCase.execute(id);
    if (!header) {
      throw new Error('Property header not found');
    }
    return header;
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех шапок' })
  @ApiResponse({ status: 200, description: 'Список шапок' })
  async getAll(
    @Param('isActive') isActive?: boolean,
    @Param('orderTypeId') orderTypeId?: number,
  ) {
    return await this.getAllPropertyHeadersUseCase.execute({ isActive, orderTypeId });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить шапку' })
  @ApiResponse({ status: 200, description: 'Шапка успешно обновлена' })
  @ApiResponse({ status: 404, description: 'Шапка не найдена' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePropertyHeaderDto,
  ) {
    return await this.updatePropertyHeaderUseCase.execute(id, dto);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Активировать шапку' })
  @ApiResponse({ status: 200, description: 'Шапка активирована' })
  @ApiResponse({ status: 404, description: 'Шапка не найдена' })
  async activate(@Param('id', ParseIntPipe) id: number) {
    return await this.activatePropertyHeaderUseCase.execute(id);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Деактивировать шапку' })
  @ApiResponse({ status: 200, description: 'Шапка деактивирована' })
  @ApiResponse({ status: 404, description: 'Шапка не найдена' })
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    return await this.deactivatePropertyHeaderUseCase.execute(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить шапку' })
  @ApiResponse({ status: 204, description: 'Шапка удалена' })
  @ApiResponse({ status: 404, description: 'Шапка не найдена' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.deletePropertyHeaderUseCase.execute(id);
  }
}