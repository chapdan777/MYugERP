import { IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductComponentSchemaDto {
    @ApiProperty({ description: 'ID продукта', example: 1 })
    @IsNumber()
    productId!: number;

    @ApiProperty({ description: 'Название компонента', example: 'Боковина правая' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ description: 'Формула длины', example: 'H - 32' })
    @IsString()
    @IsNotEmpty()
    lengthFormula!: string;

    @ApiProperty({ description: 'Формула ширины', example: 'D - 100' })
    @IsString()
    @IsNotEmpty()
    widthFormula!: string;

    @ApiProperty({ description: 'Формула количества', example: '2' })
    @IsString()
    @IsNotEmpty()
    quantityFormula!: string;
}
