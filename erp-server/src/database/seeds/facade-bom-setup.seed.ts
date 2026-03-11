import { DataSource } from 'typeorm';
import { PropertyEntity } from '../../modules/properties/infrastructure/persistence/property.entity';
import { ProductEntity } from '../../modules/products/infrastructure/persistence/product.entity';
import { ProductComponentSchemaEntity } from '../../modules/production/infrastructure/persistence/entities/product-component-schema.entity';

export async function seedFacadeBomSetup(dataSource: DataSource) {
    const propertyRepo = dataSource.getRepository(PropertyEntity);
    const productRepo = dataSource.getRepository(ProductEntity);
    const schemaRepo = dataSource.getRepository(ProductComponentSchemaEntity);

    console.log('--- Starting Facade BOM Setup Seed ---');

    // 1. Create or Find Properties
    const requiredProperties = [
        { code: 'W_PR', name: 'Ширина профиля', dataType: 'number', variableName: 'W_PR' },
        { code: 'W_PR_BOTTOM', name: 'Ширина нижней полки', dataType: 'number', variableName: 'W_PR_BOTTOM' },
        { code: 'T_PR', name: 'Толщина профиля', dataType: 'number', variableName: 'T_PR' },
        { code: 'GP', name: 'Глубина паза', dataType: 'number', variableName: 'GP' },
        { code: 'FASKA', name: 'Ширина фаски', dataType: 'number', variableName: 'FASKA' },
        { code: 'T_PAZ', name: 'Толщина паза', dataType: 'number', variableName: 'T_PAZ' },
    ];

    const propertyIds: Record<string, number> = {};

    for (const prop of requiredProperties) {
        let existingProp = await propertyRepo.findOne({ where: { code: prop.code } });
        if (!existingProp) {
            existingProp = propertyRepo.create({
                code: prop.code,
                name: prop.name,
                dataType: prop.dataType,
                isRequired: false,
                isActive: true,
                variableName: prop.variableName,
            });
            await propertyRepo.save(existingProp);
            console.log(`Created Property: ${prop.name}`);
        } else {
            console.log(`Property already exists: ${prop.name}`);
        }
        propertyIds[prop.code] = existingProp.id;
    }

    // 2. Create or Find Component Products
    const componentProducts = [
        { code: 'COMP-STOE', name: 'Стоевой профиль', type: 'PART', unit: 'шт' },
        { code: 'COMP-POP', name: 'Поперечный профиль', type: 'PART', unit: 'шт' },
        { code: 'COMP-FILENKA', name: 'Филенка', type: 'PART', unit: 'шт' },
    ];

    const compProductIds: Record<string, number> = {};

    for (const cp of componentProducts) {
        let existingCp = await productRepo.findOne({ where: { code: cp.code } });
        if (!existingCp) {
            existingCp = productRepo.create({
                code: cp.code,
                name: cp.name,
                category: cp.type === 'PART' ? 'COMPONENT' : 'PRODUCT',
                unit: cp.unit,
                basePrice: 0,
                isActive: true,
            });
            await productRepo.save(existingCp);
            console.log(`Created Component Product: ${cp.name}`);
        }
        compProductIds[cp.code] = existingCp.id;
    }

    // 3. Create or Find Universal Facade Product
    const FACADE_CODE = 'FACADE-UNIVERSAL';
    let facade = await productRepo.findOne({ where: { code: FACADE_CODE } });
    if (!facade) {
        facade = productRepo.create({
            code: FACADE_CODE,
            name: 'Фасад рамочный',
            category: 'PRODUCT',
            unit: 'шт',
            basePrice: 0,
            isActive: true,
        });
        await productRepo.save(facade);
        console.log(`Created Universal Facade Product: ${facade.name}`);
    } else {
        console.log(`Universal Facade already exists: ${facade.name}`);
    }

    // 4. Setup BOM (ProductComponentSchemas)
    // Clear existing BOM for this facade to prevent duplicates during re-runs
    await schemaRepo.delete({ productId: facade.id });

    const schemasToCreate = [
        {
            productId: facade.id,
            childProductId: compProductIds['COMP-STOE'],
            name: 'Стоевой профиль',
            lengthFormula: 'ANGLE == 45 ? (H + 2) : H',
            widthFormula: 'W_PR',
            depthFormula: 'T_PR',
            quantityFormula: '2',
            sortOrder: 1,
        },
        {
            productId: facade.id,
            childProductId: compProductIds['COMP-POP'],
            name: 'Поперечный профиль',
            lengthFormula: 'ANGLE == 45 ? (W + 2) : (W - 2 * W_PR + 2 * FASKA)',
            widthFormula: 'W_PR',
            depthFormula: 'T_PR',
            quantityFormula: '2',
            sortOrder: 2,
        },
        {
            productId: facade.id,
            childProductId: compProductIds['COMP-FILENKA'],
            name: 'Филенка',
            lengthFormula: 'H - 2 * W_PR + 2 * GP',
            widthFormula: 'W - 2 * W_PR + 2 * GP',
            depthFormula: 'T_PAZ',
            quantityFormula: '1',
            sortOrder: 3,
        }
    ];

    for (const schemaData of schemasToCreate) {
        const schema = schemaRepo.create(schemaData);
        await schemaRepo.save(schema);
    }
    console.log(`Created BOM with ${schemasToCreate.length} components for Universal Facade.`);

    console.log('--- Facade BOM Setup Seed Completed ---');
}
