import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITechnologicalRouteRepository } from '../../domain/repositories/technological-route.repository.interface';
import { TechnologicalRoute } from '../../domain/entities/technological-route.entity';
import { TechnologicalRouteEntity } from '../persistence/entities/technological-route.entity';
import { TechnologicalRouteMapper } from '../persistence/mappers/technological-route.mapper';

@Injectable()
export class TechnologicalRouteRepository implements ITechnologicalRouteRepository {
    constructor(
        @InjectRepository(TechnologicalRouteEntity)
        private readonly repository: Repository<TechnologicalRouteEntity>,
    ) { }

    async save(route: TechnologicalRoute): Promise<TechnologicalRoute> {
        const persistenceEntity = TechnologicalRouteMapper.toPersistence(route);
        const savedEntity = await this.repository.save(persistenceEntity);
        return TechnologicalRouteMapper.toDomain(savedEntity);
    }

    async findById(id: number): Promise<TechnologicalRoute | null> {
        const entity = await this.repository.findOne({
            where: { id },
        });
        return entity ? TechnologicalRouteMapper.toDomain(entity) : null;
    }

    async findByProductId(productId: number): Promise<TechnologicalRoute[]> {
        const entities = await this.repository.find({
            where: { productId },
        });
        return entities.map((entity) => TechnologicalRouteMapper.toDomain(entity));
    }

    async findActiveByProductId(productId: number): Promise<TechnologicalRoute | null> {
        const entity = await this.repository.findOne({
            where: { productId, isActive: true },
        });
        return entity ? TechnologicalRouteMapper.toDomain(entity) : null;
    }

    async findAll(): Promise<TechnologicalRoute[]> {
        const entities = await this.repository.find();
        return entities.map((entity) => TechnologicalRouteMapper.toDomain(entity));
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}
