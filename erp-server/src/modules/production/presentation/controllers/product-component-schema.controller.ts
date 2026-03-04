import { Controller, Post, Get, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateProductComponentSchemaUseCase } from '../../application/use-cases/create-product-component-schema.use-case';
import { GetProductComponentSchemasUseCase } from '../../application/use-cases/get-product-component-schemas.use-case';
import { DeleteProductComponentSchemaUseCase } from '../../application/use-cases/delete-product-component-schema.use-case';
import { UpdateProductComponentSchemaUseCase } from '../../application/use-cases/update-product-component-schema.use-case';
import { GetNestedProductPropertiesUseCase } from '../../application/use-cases/get-nested-product-properties.use-case';
import { CreateProductComponentSchemaDto } from '../../application/dto/create-product-component-schema.dto';
import { UpdateProductComponentSchemaDto } from '../../application/dto/update-product-component-schema.dto';

@ApiTags('Product Component Schemas (BOM)')
@Controller('production/schemas')
export class ProductComponentSchemaController {
    constructor(
        private readonly createUseCase: CreateProductComponentSchemaUseCase,
        private readonly getUseCase: GetProductComponentSchemasUseCase,
        private readonly deleteUseCase: DeleteProductComponentSchemaUseCase,
        private readonly updateUseCase: UpdateProductComponentSchemaUseCase,
        private readonly getNestedPropertiesUseCase: GetNestedProductPropertiesUseCase,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Создать схему компонента для продукта' })
    @ApiResponse({ status: 201, description: 'Схема создана' })
    async create(@Body() dto: CreateProductComponentSchemaDto) {
        return await this.createUseCase.execute(dto);
    }

    @Get('product/:productId')
    @ApiOperation({ summary: 'Получить схемы компонентов для продукта' })
    @ApiResponse({ status: 200, description: 'Список схем' })
    async getByProduct(@Param('productId', ParseIntPipe) productId: number) {
        return await this.getUseCase.execute(productId);
    }

    @Post(':id') // Using POST :id or PATCH :id depending on preference, Clean Arch usually prefers PATCH for partials
    @ApiOperation({ summary: 'Обновить схему компонента' })
    @ApiResponse({ status: 200, description: 'Схема обновлена' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProductComponentSchemaDto
    ) {
        return await this.updateUseCase.execute(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить схему компонента' })
    @ApiResponse({ status: 200, description: 'Схема удалена' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.deleteUseCase.execute(id);
    }

    @Get('product/:productId/nested-properties')
    @ApiOperation({ summary: 'Получить дерево вложенных свойств продукта (рекурсивно по BOM)' })
    @ApiResponse({ status: 200, description: 'Дерево вложенных свойств' })
    async getNestedProperties(@Param('productId', ParseIntPipe) productId: number) {
        return await this.getNestedPropertiesUseCase.execute(productId);
    }
}
