import { Inject, Injectable } from '@nestjs/common';
import { ITechnologicalRouteRepository, TECHNOLOGICAL_ROUTE_REPOSITORY } from '../../domain/repositories/technological-route.repository.interface';
import { TechnologicalRoute } from '../../domain/entities/technological-route.entity';

@Injectable()
export class GetTechnologicalRouteUseCase {
    constructor(
        @Inject(TECHNOLOGICAL_ROUTE_REPOSITORY)
        private readonly repository: ITechnologicalRouteRepository,
    ) { }

    async execute(productId: number): Promise<TechnologicalRoute | null> {
        const route = await this.repository.findActiveByProductId(productId);
        return route ?? null;
    }
}
