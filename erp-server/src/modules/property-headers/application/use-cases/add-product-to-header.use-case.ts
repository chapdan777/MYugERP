import { Injectable } from '@nestjs/common';
import { PropertyHeaderService } from '../../domain/services/property-header.service';
import { AddProductToHeaderDto } from '../dto/add-product-to-header.dto';
import { PropertyHeaderProduct } from '../../domain/entities/property-header-product.entity';

@Injectable()
export class AddProductToHeaderUseCase {
    constructor(
        private readonly propertyHeaderService: PropertyHeaderService,
    ) { }

    async execute(headerId: number, dto: AddProductToHeaderDto): Promise<PropertyHeaderProduct> {
        return await this.propertyHeaderService.addProductToHeader(headerId, dto.productId);
    }
}
