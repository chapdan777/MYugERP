import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITechnologicalRouteRepository, TECHNOLOGICAL_ROUTE_REPOSITORY } from '../../domain/repositories/technological-route.repository.interface';
import { TechnologicalRoute } from '../../domain/entities/technological-route.entity';

@Injectable()
export class GetTechnologicalRouteUseCase {
    constructor(
        @Inject(TECHNOLOGICAL_ROUTE_REPOSITORY)
        private readonly repository: ITechnologicalRouteRepository,
    ) { }

    async execute(productId: number): Promise<TechnologicalRoute> {
        const route = await this.repository.findActiveByProductId(productId);
        if (!route) {
            throw new NotFoundException(`Active technological route for product ${productId} not found`);
        }
        return route;
    }
}
