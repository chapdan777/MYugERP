import { Injectable } from '@nestjs/common';
import { PropertyHeaderService } from '../../domain/services/property-header.service';
import { PropertyHeaderProduct } from '../../domain/entities/property-header-product.entity';

@Injectable()
export class GetHeaderProductsUseCase {
    constructor(
        private readonly propertyHeaderService: PropertyHeaderService,
    ) { }

    async execute(headerId: number): Promise<PropertyHeaderProduct[]> {
        return await this.propertyHeaderService.getHeaderProducts(headerId);
    }
}
