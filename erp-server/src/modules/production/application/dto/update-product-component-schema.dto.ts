import { PartialType } from '@nestjs/swagger';
import { CreateProductComponentSchemaDto } from './create-product-component-schema.dto';

/**
 * DTO для обновления схемы компонента продукта
 */
export class UpdateProductComponentSchemaDto extends PartialType(CreateProductComponentSchemaDto) { }
