import { TechnologicalRoute } from '../entities/technological-route.entity';

export abstract class ITechnologicalRouteRepository {
    abstract save(route: TechnologicalRoute): Promise<TechnologicalRoute>;
    abstract findById(id: number): Promise<TechnologicalRoute | null>;
    abstract findByProductId(productId: number): Promise<TechnologicalRoute[]>;
    abstract findActiveByProductId(productId: number): Promise<TechnologicalRoute | null>;
    abstract findAll(): Promise<TechnologicalRoute[]>;
    abstract delete(id: number): Promise<void>;
}

export const TECHNOLOGICAL_ROUTE_REPOSITORY = Symbol('TECHNOLOGICAL_ROUTE_REPOSITORY');
