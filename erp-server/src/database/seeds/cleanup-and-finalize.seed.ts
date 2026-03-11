import { DataSource, In } from 'typeorm';
import { PriceModifierEntity } from '../../modules/pricing/infrastructure/persistence/price-modifier.entity';
import { ProductEntity } from '../../modules/products/infrastructure/persistence/product.entity';
import { TechnologicalRouteEntity } from '../../modules/production/infrastructure/persistence/entities/technological-route.entity';
import { RouteStepEntity } from '../../modules/production/infrastructure/persistence/entities/route-step.entity';
import { OperationEntity } from '../../modules/production/infrastructure/persistence/entities/operation.entity';

/**
 * Seed для финальной очистки данных и настройки маршрутов
 */
export async function seedCleanupAndFinalize(dataSource: DataSource): Promise<void> {
    const modifierRepo = dataSource.getRepository(PriceModifierEntity);
    const productRepo = dataSource.getRepository(ProductEntity);
    const routeRepo = dataSource.getRepository(TechnologicalRouteEntity);
    const stepRepo = dataSource.getRepository(RouteStepEntity);
    const opRepo = dataSource.getRepository(OperationEntity);

    console.log('--- Starting Cleanup and Finalization Seed ---');

    // 1. Rename confusing modifiers
    const modifiers = await modifierRepo.find();
    for (const m of modifiers) {
        if (m.name.includes('Integrity Test 2')) {
            m.name = 'Наценка: Дуб (Материал)';
            await modifierRepo.save(m);
            console.log('  Updated modifier: Integrity Test 2 -> Наценка: Дуб');
        } else if (m.name.includes('Integrity Test 3')) {
            m.name = 'Наценка: Патина Золото';
            await modifierRepo.save(m);
            console.log('  Updated modifier: Integrity Test 3 -> Наценка: Патина Золото');
        }
    }

    // 2. Fix Technological Routes for components
    const componentCodes = ['COMP-STOE', 'COMP-POP', 'COMP-FILENKA'];
    const products = await productRepo.find({ where: { code: In(componentCodes) } });
    const productMap = new Map(products.map(p => [p.code, p.id]));

    // Find operations
    const opCutting = await opRepo.findOne({ where: { code: 'R-01' } }) || await opRepo.findOne({ where: { name: 'Раскрой' } });
    const opProf = await opRepo.findOne({ where: { code: 'PR-01' } }) || await opRepo.findOne({ where: { name: 'Профилирование' } });
    const opMilling = await opRepo.findOne({ where: { code: 'F-01' } }) || await opRepo.findOne({ where: { name: 'Фрезеровка большая' } });
    const opPress = await opRepo.findOne({ where: { code: 'S-01' } }) || await opRepo.findOne({ where: { name: 'Шпонирование филенки' } });

    // Routes for Profiles (Стоевой и Поперечный)
    for (const code of ['COMP-STOE', 'COMP-POP']) {
        const productId = productMap.get(code);
        if (productId) {
            // Clear old routes
            await routeRepo.delete({ productId });

            const route = await routeRepo.save(routeRepo.create({
                productId,
                name: `Изготовление профиля (${code})`,
                isActive: true
            }));

            // Step 1: Cutting (Раскрой профиля в размер)
            if (opCutting) {
                await stepRepo.save(stepRepo.create({
                    routeId: route.id,
                    operationId: opCutting.id,
                    stepNumber: 1,
                    isRequired: true
                }));
            }

            // Step 2: Profiling (Профилирование)
            if (opProf) {
                await stepRepo.save(stepRepo.create({
                    routeId: route.id,
                    operationId: opProf.id,
                    stepNumber: 2,
                    isRequired: true
                }));
            }
            console.log(`  Created route for ${code}`);
        }
    }

    // Route for Filenka
    const filenkaId = productMap.get('COMP-FILENKA');
    if (filenkaId) {
        await routeRepo.delete({ productId: filenkaId });
        const route = await routeRepo.save(routeRepo.create({
            productId: filenkaId,
            name: 'Изготовление филенки',
            isActive: true
        }));

        if (opCutting) {
            await stepRepo.save(stepRepo.create({ routeId: route.id, operationId: opCutting.id, stepNumber: 1, isRequired: true }));
        }
        if (opMilling) {
            await stepRepo.save(stepRepo.create({ routeId: route.id, operationId: opMilling.id, stepNumber: 2, isRequired: true }));
        }
        if (opPress) {
            await stepRepo.save(stepRepo.create({ routeId: route.id, operationId: opPress.id, stepNumber: 3, isRequired: true }));
        }
        console.log('  Created route for COMP-FILENKA');
    }

    console.log('--- Cleanup and Finalization Seed Completed ---');
}
