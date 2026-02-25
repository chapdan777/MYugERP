import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { CalculatePriceUseCase } from '../../application/use-cases/calculate-price.use-case';

import { IsNumber, IsOptional, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PricePropertyDto {
    @IsNumber()
    propertyId!: number;

    @IsString()
    propertyValue!: string;
}

export class CalculatePriceRequestDto {
    @IsNumber()
    @Type(() => Number)
    productId!: number;

    @IsNumber()
    @Type(() => Number)
    quantity!: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    length?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    width?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    depth?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    basePrice?: number;

    @IsOptional()
    @IsString()
    unitType?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    coefficient?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PricePropertyDto)
    propertyValues!: PricePropertyDto[];
}

@Controller('pricing')
@UseGuards(JwtAuthGuard)
export class PricingController {
    constructor(
        private readonly calculatePriceUseCase: CalculatePriceUseCase,
    ) { }

    @Post('calculate')
    @HttpCode(HttpStatus.OK)
    async calculate(@Body() dto: CalculatePriceRequestDto) {
        return this.calculatePriceUseCase.execute({
            basePrice: 0, // Not needed when productId is provided
            quantity: dto.quantity,
            productId: dto.productId,
            length: dto.length,
            width: dto.width,
            depth: dto.depth,
            propertyValues: dto.propertyValues,
            // unitType and coefficient will be determined by the calculator logic or defaults
        });
    }
}
