import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AddProductToHeaderDto {
    @ApiProperty({ description: 'ID продукта', example: 1 })
    @IsInt()
    @IsNotEmpty()
    @Min(1)
    productId!: number;
}
