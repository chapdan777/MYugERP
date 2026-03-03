import { DataSource } from 'typeorm';
import { ProductComponentSchemaEntity } from '../../modules/production/infrastructure/persistence/entities/product-component-schema.entity';

/**
 * Seed для схем компонентов (BOM)
 */
export async function seedBomSchemas(dataSource: DataSource): Promise<void> {
    const schemaRepo = dataSource.getRepository(ProductComponentSchemaEntity);

    const schemas = [
        // Схемы для продукта 15 (Фасад с филенкой)
        {
            productId: 15,
            name: 'Профиль вертикальный (стоевая)',
            lengthFormula: 'H', // Высота изделия
            widthFormula: '70', // Ширина профиля 70мм
            quantityFormula: '2',
            sortOrder: 1
        },
        {
            productId: 15,
            name: 'Профиль горизонтальный (поперечка)',
            lengthFormula: 'W - 140 + 24', // Ширина - 2*70 + 2*12(шип)
            widthFormula: '70',
            quantityFormula: '2',
            sortOrder: 2
        },
        {
            productId: 15,
            name: 'Филенка (вставка)',
            lengthFormula: 'H - 140 + 20', // Высота - 2*70 + 2*10(паз)
            widthFormula: 'W - 140 + 20', // Ширина - 2*70 + 2*10(паз)
            quantityFormula: '1',
            sortOrder: 3
        }
    ];

    for (const sData of schemas) {
        const existing = await schemaRepo.findOne({
            where: { productId: sData.productId, name: sData.name }
        });

        if (!existing) {
            console.log(`🌱 Creating BOM schema for product ${sData.productId}: ${sData.name}`);
            await schemaRepo.save(schemaRepo.create(sData));
        }
    }
}
