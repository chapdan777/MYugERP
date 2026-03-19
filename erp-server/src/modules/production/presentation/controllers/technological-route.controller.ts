import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Patch, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { CreateTechnologicalRouteUseCase } from '../../application/use-cases/create-technological-route.use-case';
import { GetTechnologicalRouteUseCase } from '../../application/use-cases/get-technological-route.use-case';
import { UpdateTechnologicalRouteUseCase } from '../../application/use-cases/update-technological-route.use-case';
import { CreateTechnologicalRouteDto, UpdateTechnologicalRouteDto, TechnologicalRouteResponseDto } from '../../presentation/dtos/technological-route.dto';
import { TECHNOLOGICAL_ROUTE_REPOSITORY, ITechnologicalRouteRepository } from '../../domain/repositories/technological-route.repository.interface';

@ApiTags('Technological Routes')
@Controller('production/technological-routes')
export class TechnologicalRouteController {
    constructor(
        private readonly createUseCase: CreateTechnologicalRouteUseCase,
        private readonly getUseCase: GetTechnologicalRouteUseCase,
        private readonly updateUseCase: UpdateTechnologicalRouteUseCase,
        @Inject(TECHNOLOGICAL_ROUTE_REPOSITORY)
        private readonly routeRepository: ITechnologicalRouteRepository,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Создать технологический маршрут или шаблон' })
    @ApiResponse({ status: 201, description: 'Маршрут успешно создан', type: TechnologicalRouteResponseDto })
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async create(@Body() dto: CreateTechnologicalRouteDto): Promise<TechnologicalRouteResponseDto> {
        const route = await this.createUseCase.execute(dto);
        return TechnologicalRouteResponseDto.fromEntity(route);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить технологический маршрут или шаблон' })
    @ApiResponse({ status: 200, description: 'Маршрут успешно обновлен', type: TechnologicalRouteResponseDto })
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTechnologicalRouteDto
    ): Promise<TechnologicalRouteResponseDto> {
        const route = await this.updateUseCase.execute(id, dto);
        return TechnologicalRouteResponseDto.fromEntity(route);
    }

    @Get('product/:id')
    @ApiOperation({ summary: 'Получить активный маршрут продукта' })
    @ApiResponse({ status: 200, description: 'Маршрут найден или null', type: TechnologicalRouteResponseDto })
    async getByProduct(@Param('id', ParseIntPipe) id: number): Promise<TechnologicalRouteResponseDto | null> {
        const route = await this.getUseCase.execute(id);
        return route ? TechnologicalRouteResponseDto.fromEntity(route) : null;
    }

    @Get('templates')
    @ApiOperation({ summary: 'Получить все шаблоны маршрутов' })
    @ApiResponse({ status: 200, description: 'Список шаблонов', type: [TechnologicalRouteResponseDto] })
    async getTemplates(): Promise<TechnologicalRouteResponseDto[]> {
        const templates = await this.routeRepository.findTemplates();
        return templates.map(t => TechnologicalRouteResponseDto.fromEntity(t));
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить маршрут или шаблон' })
    @ApiResponse({ status: 200, description: 'Маршрут удалён' })
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.routeRepository.delete(id);
    }
}

