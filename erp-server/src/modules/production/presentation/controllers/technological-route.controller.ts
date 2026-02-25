import { Body, Controller, Get, Param, ParseIntPipe, Post, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateTechnologicalRouteUseCase } from '../../application/use-cases/create-technological-route.use-case';
import { GetTechnologicalRouteUseCase } from '../../application/use-cases/get-technological-route.use-case';
import { CreateTechnologicalRouteDto, TechnologicalRouteResponseDto } from '../../presentation/dtos/technological-route.dto';

@ApiTags('Technological Routes')
@Controller('production/technological-routes')
export class TechnologicalRouteController {
    constructor(
        private readonly createUseCase: CreateTechnologicalRouteUseCase,
        private readonly getUseCase: GetTechnologicalRouteUseCase,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Создать технологический маршрут для продукта' })
    @ApiResponse({ status: 201, description: 'Маршрут успешно создан', type: TechnologicalRouteResponseDto })
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async create(@Body() dto: CreateTechnologicalRouteDto): Promise<TechnologicalRouteResponseDto> {
        const route = await this.createUseCase.execute(dto);
        return TechnologicalRouteResponseDto.fromEntity(route);
    }

    @Get('product/:id')
    @ApiOperation({ summary: 'Получить активный маршрут продукта' })
    @ApiResponse({ status: 200, description: 'Маршрут найден', type: TechnologicalRouteResponseDto })
    async getByProduct(@Param('id', ParseIntPipe) id: number): Promise<TechnologicalRouteResponseDto> {
        const route = await this.getUseCase.execute(id);
        return TechnologicalRouteResponseDto.fromEntity(route);
    }
}
