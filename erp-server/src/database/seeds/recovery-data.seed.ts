import { DataSource, In } from 'typeorm';
import { PropertyEntity } from '../../modules/properties/infrastructure/persistence/property.entity';
import { ProductEntity } from '../../modules/products/infrastructure/persistence/product.entity';
import { OperationEntity } from '../../modules/production/infrastructure/persistence/entities/operation.entity';
import { ProductionDepartmentEntity } from '../../modules/production/infrastructure/persistence/entities/production-department.entity';
import { DepartmentOperationEntity } from '../../modules/production/infrastructure/persistence/entities/department-operation.entity';
import { TechnologicalRouteEntity } from '../../modules/production/infrastructure/persistence/entities/technological-route.entity';
import { RouteStepEntity } from '../../modules/production/infrastructure/persistence/entities/route-step.entity';
import { RouteStepMaterialEntity } from '../../modules/production/infrastructure/persistence/entities/route-step-material.entity';
import { OperationCalculationType } from '../../modules/production/domain/enums/operation-calculation-type.enum';
import { GroupingStrategy } from '../../modules/production/domain/entities/production-department.entity';

import { PropertyHeaderEntity } from '../../modules/property-headers/infrastructure/persistence/property-header.entity';
import { PropertyHeaderItemEntity } from '../../modules/property-headers/infrastructure/persistence/property-header-item.entity';

export async function seedRecoveryData(dataSource: DataSource): Promise<void> {
    const propertyRepo = dataSource.getRepository(PropertyEntity);
    const productRepo = dataSource.getRepository(ProductEntity);
    const operationRepo = dataSource.getRepository(OperationEntity);
    const departmentRepo = dataSource.getRepository(ProductionDepartmentEntity);
    const deptOpRepo = dataSource.getRepository(DepartmentOperationEntity);
    const routeRepo = dataSource.getRepository(TechnologicalRouteEntity);
    const stepRepo = dataSource.getRepository(RouteStepEntity);
    const stepMaterialRepo = dataSource.getRepository(RouteStepMaterialEntity);
    const headerRepo = dataSource.getRepository(PropertyHeaderEntity);
    const headerItemRepo = dataSource.getRepository(PropertyHeaderItemEntity);

    console.log('--- Starting Recovery Data Seed ---');

    // 1. Create missing properties
    const propertiesToCreate = [
        { code: 'color', name: 'Цвет', dataType: 'select', variableName: 'color', possibleValues: 'Белый,Кремовый,RAL 7035,Дуб,Орех' },
        { code: 'patina', name: 'Патина', dataType: 'select', variableName: 'patina', possibleValues: 'Нет,Золото,Серебро,Коричневая' },
        { code: 'gloss', name: 'Глянцевость', dataType: 'select', variableName: 'gloss', possibleValues: 'Матовый,Глянцевый,Спецэффект' },
        { code: 'model', name: 'Модель фасада', dataType: 'select', variableName: 'model', possibleValues: 'Афина,Вероника,Алиери' },
        { code: 'assembly_angle', name: 'Угол сборки', dataType: 'select', variableName: 'ANGLE', possibleValues: '45,90' },
    ];

    const propIdMap: Record<string, number> = {};
    for (const prop of propertiesToCreate) {
        let existing = await propertyRepo.findOne({ where: { code: prop.code } });
        if (!existing) {
            existing = await propertyRepo.save(propertyRepo.create({ ...prop, isActive: true, isRequired: false }));
            console.log(`  Property created: ${prop.name}`);
        } else {
            // Update to list if needed
            existing.dataType = prop.dataType;
            existing.possibleValues = prop.possibleValues || null;
            await propertyRepo.save(existing);
        }
        propIdMap[prop.code] = existing.id;
    }

    // 1.1 Create Property Header (Шапка заказа)
    let header = await headerRepo.findOne({ where: { name: 'Параметры отделки' } });
    if (!header) {
        header = await headerRepo.save(headerRepo.create({
            name: 'Параметры отделки',
            orderTypeId: 1, // Base type
            isActive: true
        }));
        console.log(`  Property Header created: ${header.name}`);

        const headerProps = ['color', 'patina', 'gloss', 'assembly_angle'];
        for (let i = 0; i < headerProps.length; i++) {
            const propId = propIdMap[headerProps[i]];
            if (propId) {
                await headerItemRepo.save(headerItemRepo.create({
                    headerId: header.id,
                    propertyId: propId,
                    sortOrder: i
                }));
            }
        }
    }

    // 2. Create Materials
    const materialsToCreate = [
        { code: 'MAT-MDF10', name: 'МДФ 10мм', category: 'MATERIAL', unit: 'м2', basePrice: 500 },
        { code: 'MAT-VENEER', name: 'Шпон', category: 'MATERIAL', unit: 'м2', basePrice: 1200 },
        { code: 'MAT-GLUE', name: 'Клей ПВА', category: 'MATERIAL', unit: 'кг', basePrice: 350 },
        { code: 'MAT-ABRASIVE', name: 'Шкурка шлифовальная', category: 'MATERIAL', unit: 'шт', basePrice: 50 },
        { code: 'MAT-PRIMER-W', name: 'Грунт белый', category: 'MATERIAL', unit: 'кг', basePrice: 800 },
        { code: 'MAT-PRIMER-C', name: 'Грунт прозрачный', category: 'MATERIAL', unit: 'кг', basePrice: 750 },
        { code: 'MAT-ENAMEL', name: 'Эмаль', category: 'MATERIAL', unit: 'кг', basePrice: 1500 },
        { code: 'MAT-STAIN', name: 'Морилка', category: 'MATERIAL', unit: 'кг', basePrice: 900 },
        { code: 'MAT-LACQUER', name: 'Лак', category: 'MATERIAL', unit: 'кг', basePrice: 1100 },
    ];

    const materialsMap: Record<string, number> = {};
    for (const mat of materialsToCreate) {
        let material = await productRepo.findOne({ where: { code: mat.code } });
        if (!material) {
            material = await productRepo.save(productRepo.create({ ...mat, isActive: true }));
            console.log(`  Material created: ${mat.name}`);
        }
        materialsMap[mat.code] = material.id;
    }

    // 3. Create Operations
    const operationsToCreate = [
        { code: 'R-01', name: 'Раскрой', calculationType: OperationCalculationType.PER_PIECE },
        { code: 'F-01', name: 'Фрезеровка большая', calculationType: OperationCalculationType.PER_PIECE },
        { code: 'S-01', name: 'Шпонирование филенки', calculationType: OperationCalculationType.PER_PIECE },
        { code: 'SCM-01', name: 'Шлифовка SCM', calculationType: OperationCalculationType.PER_PIECE },
        { code: 'PR-01', name: 'Профилирование', calculationType: OperationCalculationType.PER_PIECE },
        { code: 'SB-01', name: 'Сборка', calculationType: OperationCalculationType.PER_PIECE },
        { code: 'SH-01', name: 'Шлифовка', calculationType: OperationCalculationType.PER_PIECE },
        { code: 'P-01', name: 'Покраска', calculationType: OperationCalculationType.PER_PIECE },
        { code: 'U-01', name: 'Упаковка', calculationType: OperationCalculationType.PER_PIECE },
    ];

    const opsMap: Record<string, number> = {};
    for (const opData of operationsToCreate) {
        let op = await operationRepo.findOne({ where: { code: opData.code } });
        if (!op) {
            op = await operationRepo.save(operationRepo.create(opData));
            console.log(`  Operation created: ${opData.name}`);
        }
        opsMap[opData.code] = op.id;
    }

    // 4. Create Departments
    const deptsToCreate = [
        { code: 'DEPT-R', name: 'Участок Раскроя', ops: ['R-01'] },
        { code: 'DEPT-CHPU', name: 'Участок ЧПУ', ops: ['F-01'] },
        { code: 'DEPT-PRESS', name: 'Горячий пресс', ops: ['S-01'] },
        { code: 'DEPT-SHLIF', name: 'Участок Шлифовки', ops: ['SCM-01', 'SH-01'] },
        { code: 'DEPT-PROF', name: 'Участок Профилирования', ops: ['PR-01'] },
        { code: 'DEPT-SBR', name: 'Сборочный цех', ops: ['SB-01'] },
        { code: 'DEPT-MAL', name: 'Малярный участок', ops: ['P-01'] },
        { code: 'DEPT-UPK', name: 'Участок Упаковки', ops: ['U-01'] },
    ];

    for (const d of deptsToCreate) {
        let dept = await departmentRepo.findOne({ where: { code: d.code } });
        if (!dept) {
            dept = await departmentRepo.save(departmentRepo.create({
                code: d.code,
                name: d.name,
                groupingStrategy: GroupingStrategy.BY_ORDER,
                isActive: true
            }));
            console.log(`  Department created: ${d.name}`);

            for (const opCode of d.ops) {
                await deptOpRepo.save(deptOpRepo.create({
                    departmentId: dept.id,
                    operationId: opsMap[opCode],
                    priority: 5
                }));
            }
        }
    }

    // 5. Technological Routes
    const products = await productRepo.find({ where: { code: In(['COMP-FILENKA', 'COMP-STOE', 'COMP-POP-TOP', 'COMP-POP-BOT', 'FACADE-UNIVERSAL']) } });
    const productIds: Record<string, number> = {};
    products.forEach(p => productIds[p.code] = p.id);

    // 5.1 Route for Filenka
    if (productIds['COMP-FILENKA']) {
        await routeRepo.delete({ productId: productIds['COMP-FILENKA'] });
        const route = await routeRepo.save(routeRepo.create({
            productId: productIds['COMP-FILENKA'],
            name: 'Маршрут изготовления филенки',
            isActive: true
        }));

        const steps = [
            { op: 'R-01', num: 1, materials: [{ id: materialsMap['MAT-MDF10'], formula: '(H * W) / 1000000', unit: 'м2' }] },
            { op: 'F-01', num: 2 },
            {
                op: 'S-01', num: 3, materials: [
                    { id: materialsMap['MAT-VENEER'], formula: '(H * W) * 2 / 1000000', unit: 'м2' },
                    { id: materialsMap['MAT-GLUE'], formula: '(H * W) * 0.0002', unit: 'кг' }
                ]
            },
            { op: 'SCM-01', num: 4, materials: [{ id: materialsMap['MAT-ABRASIVE'], formula: '0.1', unit: 'шт' }] }
        ];

        for (const s of steps) {
            const step = await stepRepo.save(stepRepo.create({
                routeId: route.id,
                operationId: opsMap[s.op],
                stepNumber: s.num,
                isRequired: true
            }));
            if (s.materials) {
                for (const m of s.materials) {
                    await stepMaterialRepo.save(stepMaterialRepo.create({
                        routeStepId: step.id,
                        materialId: m.id,
                        consumptionFormula: m.formula,
                        unit: m.unit || 'м2'
                    }));
                }
            }
        }
    }

    // 5.2 Routes for Profiles
    const profileCodes = ['COMP-STOE', 'COMP-POP'];
    for (const code of profileCodes) {
        if (productIds[code]) {
            await routeRepo.delete({ productId: productIds[code] });
            const pRoute = await routeRepo.save(routeRepo.create({
                productId: productIds[code],
                name: `Маршрут для: ${code}`,
                isActive: true
            }));
            await stepRepo.save(stepRepo.create({
                routeId: pRoute.id,
                operationId: opsMap['PR-01'],
                stepNumber: 1,
                isRequired: true
            }));
        }
    }

    // 5.3 Route for Universal Facade
    if (productIds['FACADE-UNIVERSAL']) {
        await routeRepo.delete({ productId: productIds['FACADE-UNIVERSAL'] });
        const route = await routeRepo.save(routeRepo.create({
            productId: productIds['FACADE-UNIVERSAL'],
            name: 'Маршрут сборки и покраски фасада',
            isActive: true
        }));

        const facadeSteps = [
            { op: 'SB-01', num: 1, materials: [{ id: materialsMap['MAT-GLUE'], formula: '0.05', unit: 'кг' }] },
            { op: 'SH-01', num: 2, materials: [{ id: materialsMap['MAT-ABRASIVE'], formula: '0.2', unit: 'шт' }] },
            {
                op: 'P-01', num: 3, materials: [
                    { id: materialsMap['MAT-PRIMER-W'], formula: 'is_enamel == 1 ? (H*W)/1000000 * 0.2 : 0', unit: 'кг' },
                    { id: materialsMap['MAT-PRIMER-C'], formula: 'is_enamel == 0 ? (H*W)/1000000 * 0.2 : 0', unit: 'кг' },
                    { id: materialsMap['MAT-ENAMEL'], formula: 'is_enamel == 1 ? (H*W)/1000000 * 0.3 : 0', unit: 'кг' },
                    { id: materialsMap['MAT-STAIN'], formula: 'is_enamel == 0 ? (H*W)/1000000 * 0.1 : 0', unit: 'кг' },
                    { id: materialsMap['MAT-LACQUER'], formula: 'has_patina == 1 ? (H*W)/1000000 * 0.15 : (is_enamel == 0 ? (H*W)/1000000 * 0.2 : 0)', unit: 'кг' }
                ]
            },
            { op: 'U-01', num: 4 }
        ];

        for (const s of facadeSteps) {
            const step = await stepRepo.save(stepRepo.create({
                routeId: route.id,
                operationId: opsMap[s.op],
                stepNumber: s.num,
                isRequired: true
            }));
            if (s.materials) {
                for (const m of s.materials) {
                    await stepMaterialRepo.save(stepMaterialRepo.create({
                        routeStepId: step.id,
                        materialId: m.id,
                        consumptionFormula: m.formula,
                        unit: m.unit || 'кг'
                    }));
                }
            }
        }
    }

    console.log('--- Recovery Data Seed Completed ---');
}
