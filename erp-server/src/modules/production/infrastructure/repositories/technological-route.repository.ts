import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITechnologicalRouteRepository } from '../../domain/repositories/technological-route.repository.interface';
import { TechnologicalRoute } from '../../domain/entities/technological-route.entity';
import { TechnologicalRouteEntity } from '../persistence/entities/technological-route.entity';
import { TechnologicalRouteMapper } from '../persistence/mappers/technological-route.mapper';

import { RouteStepEntity } from '../persistence/entities/route-step.entity';
import { RouteStepMaterialEntity } from '../persistence/entities/route-step-material.entity';

@Injectable()
export class TechnologicalRouteRepository implements ITechnologicalRouteRepository {
    constructor(
        @InjectRepository(TechnologicalRouteEntity)
        private readonly repository: Repository<TechnologicalRouteEntity>,
    ) { }

    async save(route: TechnologicalRoute): Promise<TechnologicalRoute> {
        return await this.repository.manager.transaction(async (manager) => {
            const persistenceRoute = TechnologicalRouteMapper.toPersistence(route);
            const routeId = persistenceRoute.id;

            // Если это обновление существующего маршрута
            if (routeId) {
                // 1. Сначала удаляем старые материалы и шаги вручную
                // Используем QueryBuilder для корректного удаления по связи
                await manager
                    .createQueryBuilder()
                    .delete()
                    .from(RouteStepMaterialEntity)
                    .where(
                        'route_step_id IN (SELECT id FROM route_steps WHERE route_id = :routeId)',
                        { routeId },
                    )
                    .execute();

                await manager
                    .createQueryBuilder()
                    .delete()
                    .from(RouteStepEntity)
                    .where('route_id = :routeId', { routeId })
                    .execute();
            }

            // 2. Сохраняем базовую инфо маршрута (без шагов во временном объекте)
            const stepsToSave = persistenceRoute.steps;
            persistenceRoute.steps = [];
            const savedRouteEntity = await manager.save(persistenceRoute);

            // 3. Сохраняем новые шаги
            if (stepsToSave && stepsToSave.length > 0) {
                for (const step of stepsToSave) {
                    step.route = savedRouteEntity;
                    // Каскад на уровне RouteStepEntity сохранит материалы
                    await manager.save(step);
                }
            }

            // 4. Загружаем финальный результат со всеми связями
            const finalEntity = await manager.findOne(TechnologicalRouteEntity, {
                where: { id: savedRouteEntity.id },
                relations: ['steps', 'steps.materials'],
            });

            if (!finalEntity) {
                throw new Error('Ошибка при сохранении маршрута: не удалось загрузить результат');
            }

            return TechnologicalRouteMapper.toDomain(finalEntity);
        });
    }

    async findById(id: number): Promise<TechnologicalRoute | null> {
        const entity = await this.repository.findOne({
            where: { id },
            relations: ['steps', 'steps.materials'],
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
            where: { productId, isActive: true, isTemplate: false },
            relations: ['steps', 'steps.materials'],
        });
        return entity ? TechnologicalRouteMapper.toDomain(entity) : null;
    }

    async findTemplates(): Promise<TechnologicalRoute[]> {
        const entities = await this.repository.find({
            where: { isTemplate: true },
            relations: ['steps', 'steps.materials'],
        });
        return entities.map((entity) => TechnologicalRouteMapper.toDomain(entity));
    }

    async findAll(): Promise<TechnologicalRoute[]> {
        const entities = await this.repository.find();
        return entities.map((entity) => TechnologicalRouteMapper.toDomain(entity));
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}
