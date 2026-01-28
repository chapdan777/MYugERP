import { Injectable } from '@nestjs/common';
import { PropertyHeaderService } from '../../domain/services/property-header.service';

@Injectable()
export class RemoveProductFromHeaderUseCase {
    constructor(
        private readonly propertyHeaderService: PropertyHeaderService,
    ) { }

    async execute(headerId: number, productId: number): Promise<void> {
        await this.propertyHeaderService.removeProductFromHeader(headerId, productId);
    }
}
