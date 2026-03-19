import { DataSource } from 'typeorm';
import { OperationEntity } from '../../modules/production/infrastructure/persistence/entities/operation.entity';
import { ProductEntity } from '../../modules/products/infrastructure/persistence/product.entity';
import { TechnologicalRouteEntity } from '../../modules/production/infrastructure/persistence/entities/technological-route.entity';
import { RouteStepEntity } from '../../modules/production/infrastructure/persistence/entities/route-step.entity';
import { RouteStepMaterialEntity } from '../../modules/production/infrastructure/persistence/entities/route-step-material.entity';

/**
 * Сид для создания стандартных шаблонов технологических маршрутов.
 * Эти шаблоны будут доступны для выбора в карточке товара.
 */
export async function seedRouteTemplates(dataSource: DataSource): Promise<void> {
    const operationRepo = dataSource.getRepository(OperationEntity);
    const productRepo = dataSource.getRepository(ProductEntity);
    const routeRepo = dataSource.getRepository(TechnologicalRouteEntity);
    const stepRepo = dataSource.getRepository(RouteStepEntity);
    const stepMaterialRepo = dataSource.getRepository(RouteStepMaterialEntity);

    console.log('--- Наполнение базы стандартными шаблонами маршрутов ---');

    // Находим нужные операции
    const operations = await operationRepo.find();
    const opsMap: Record<string, number> = {};
    operations.forEach(op => opsMap[op.code] = op.id);

    // Находим материалы
    const materials = await productRepo.find({ where: { category: 'MATERIAL' } });
    const matMap: Record<string, number> = {};
    materials.forEach(m => matMap[m.code] = m.id);

    // Условия (сокращения для формул conditionFormula)
    const NOT_OLHA_ENAMEL = 'not(material == "Ольха" and is_enamel == 1)';
    const DUB_ENAMEL = 'material == "Дуб" and is_enamel == 1';

    // Определения шаблонов
    const templateDefinitions = [
        {
            name: 'Шаблон: Филенка Стандарт',
            description: 'Стандартный техпроцесс для филенок: Раскрой -> Фрезеровка -> Шпонирование -> Шлифовка',
            steps: [
                { op: 'R-01', num: 1, materials: [{ code: 'MAT-MDF10', formula: '(H * W) / 1000000', unit: 'м2' }] },
                { op: 'F-01', num: 2 },
                { op: 'S-01', num: 3, condition: NOT_OLHA_ENAMEL, materials: [
                    { code: 'MAT-VENEER', formula: '(H * W) * 2 / 1000000', unit: 'м2' },
                    { code: 'MAT-GLUE', formula: '(H * W) * 0.0002', unit: 'кг' },
                ]},
                { op: 'S-02', num: 4, condition: DUB_ENAMEL, materials: [
                    { code: 'MAT-VENEER', formula: '(H * W) / 1000000', unit: 'м2' },
                    { code: 'MAT-GLUE', formula: '(H * W) * 0.0001', unit: 'кг' },
                ]},
                { op: 'NT-01', num: 5, condition: DUB_ENAMEL, materials: [
                    { code: 'MAT-FILM-TEX', formula: '(H * W) / 1000000', unit: 'м2' },
                ]},
                { op: 'SCM-01', num: 6, materials: [{ code: 'MAT-ABRASIVE', formula: '0.1', unit: 'шт' }] },
            ]
        },
        {
            name: 'Шаблон: Филенка Плоская',
            description: 'Техпроцесс для плоских филенок (без большой фрезеровки)',
            steps: [
                { op: 'R-01', num: 1, materials: [{ code: 'MAT-MDF10', formula: '(H * W) / 1000000', unit: 'м2' }] },
                { op: 'F-02', num: 2, condition: 'groove_depth > 0' },
                { op: 'S-01', num: 3, condition: NOT_OLHA_ENAMEL, materials: [
                    { code: 'MAT-VENEER', formula: '(H * W) * 2 / 1000000', unit: 'м2' },
                    { code: 'MAT-GLUE', formula: '(H * W) * 0.0002', unit: 'кг' },
                ]},
                { op: 'SCM-01', num: 4, materials: [{ code: 'MAT-ABRASIVE', formula: '0.1', unit: 'шт' }] },
            ]
        },
        {
            name: 'Шаблон: Филенка Вероника / Лондон',
            description: 'Техпроцесс со шпонированием ПЕРЕД фрезеровкой',
            steps: [
                { op: 'R-01', num: 1, materials: [{ code: 'MAT-MDF10', formula: '(H * W) / 1000000', unit: 'м2' }] },
                { op: 'S-01', num: 2, materials: [
                    { code: 'MAT-VENEER', formula: '(H * W) * 2 / 1000000', unit: 'м2' },
                    { code: 'MAT-GLUE', formula: '(H * W) * 0.0002', unit: 'кг' },
                ]},
                { op: 'F-01', num: 3 },
                { op: 'SCM-01', num: 4, materials: [{ code: 'MAT-ABRASIVE', formula: '0.1', unit: 'шт' }] },
            ]
        },
        {
            name: 'Шаблон: Сборка и покраска фасада',
            description: 'Финишный техпроцесс: Сборка -> Шлифовка -> Покраска -> Упаковка',
            steps: [
                { op: 'SB-01', num: 1, materials: [{ code: 'MAT-GLUE', formula: '0.05', unit: 'кг' }] },
                { op: 'SH-01', num: 2, materials: [{ code: 'MAT-ABRASIVE', formula: '0.2', unit: 'шт' }] },
                {
                    op: 'P-01', num: 3, materials: [
                        { code: 'MAT-PRIMER-W', formula: 'is_enamel == 1 ? (H*W)/1000000 * 0.2 : 0', unit: 'кг' },
                        { code: 'MAT-PRIMER-C', formula: 'is_enamel == 0 ? (H*W)/1000000 * 0.2 : 0', unit: 'кг' },
                        { code: 'MAT-ENAMEL', formula: 'is_enamel == 1 ? (H*W)/1000000 * 0.3 : 0', unit: 'кг' },
                        { code: 'MAT-STAIN', formula: 'is_enamel == 0 ? (H*W)/1000000 * 0.1 : 0', unit: 'кг' },
                        { code: 'MAT-LACQUER', formula: 'has_patina == 1 ? (H*W)/1000000 * 0.15 : (is_enamel == 0 ? (H*W)/1000000 * 0.2 : 0)', unit: 'кг' }
                    ]
                },
                { op: 'U-01', num: 4 }
            ]
        }
    ];

    for (const def of templateDefinitions) {
        // Проверяем, существует ли уже шаблон с таким именем
        let existingRoute = await routeRepo.findOne({ where: { name: def.name, isTemplate: true } });
        if (existingRoute) {
            console.log(`  Шаблон "${def.name}" уже существует, пропускаем...`);
            continue;
        }

        // Создаем заголовок маршрута
        const routeData = routeRepo.create({
            name: def.name,
            description: def.description,
            isTemplate: true,
            isActive: true,
            productId: undefined // Using undefined instead of null to avoid lint error
        });
        
        const route = await routeRepo.save(routeData);

        console.log(`  Создан шаблон: ${def.name}`);

        // Добавляем шаги
        for (const s of def.steps) {
            const operationId = opsMap[s.op];
            if (!operationId) {
                console.warn(`    ⚠️ Операция с кодом ${s.op} не найдена, шаг ${s.num} пропущен`);
                continue;
            }

            const step = await stepRepo.save(stepRepo.create({
                routeId: route.id,
                operationId: operationId,
                stepNumber: s.num,
                isRequired: true,
                conditionFormula: s.condition || null
            }));

            // Добавляем материалы к шагу
            if (s.materials) {
                for (const m of s.materials) {
                    const materialId = matMap[m.code];
                    if (!materialId) {
                        console.warn(`      ⚠️ Материал с кодом ${m.code} не найден`);
                        continue;
                    }

                    await stepMaterialRepo.save(stepMaterialRepo.create({
                        routeStepId: step.id,
                        materialId: materialId,
                        consumptionFormula: m.formula,
                        unit: m.unit
                    }));
                }
            }
        }
    }

    console.log('--- Сид шаблонов маршрутов завершен ---');
}
