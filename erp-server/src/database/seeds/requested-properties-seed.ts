import { DataSource } from 'typeorm';
import { PropertyEntity } from '../../modules/properties/infrastructure/persistence/property.entity';
import { PropertyValueEntity } from '../../modules/properties/infrastructure/persistence/property-value.entity';

/**
 * Seed для запрошенных пользователем свойств
 */
export async function seedRequestedProperties(dataSource: DataSource): Promise<void> {
    const propertyRepo = dataSource.getRepository(PropertyEntity);
    const valueRepo = dataSource.getRepository(PropertyValueEntity);

    const propertiesToCreate = [
        {
            code: 'texture',
            name: 'Текстура',
            dataType: 'select',
            variableName: 'TEXTURE',
            values: ['прямая', 'витая']
        },
        {
            code: 'patina',
            name: 'Патина',
            dataType: 'select',
            variableName: 'PATINA',
            values: []
        },
        {
            code: 'hinge_drilling',
            name: 'Присадка под петли',
            dataType: 'boolean',
            variableName: 'HINGE_DRILLING',
            values: []
        }
    ];

    for (const pData of propertiesToCreate) {
        let property = await propertyRepo.findOne({ where: { code: pData.code } });

        if (!property) {
            console.log(`🌱 Creating property: ${pData.name} (${pData.code})`);
            property = propertyRepo.create({
                code: pData.code,
                name: pData.name,
                dataType: pData.dataType,
                variableName: pData.variableName,
                isActive: true,
                possibleValues: pData.values.length > 0 ? JSON.stringify(pData.values) : null,
                isRequired: false,
                displayOrder: 0
            });
            property = await propertyRepo.save(property);
        } else {
            console.log(`⚠️ Property ${pData.code} already exists, skipping creation.`);
        }

        // Add values if any
        for (let i = 0; i < pData.values.length; i++) {
            const val = pData.values[i];
            const existingValue = await valueRepo.findOne({
                where: { propertyId: property.id, value: val }
            });

            if (!existingValue) {
                console.log(`   └─ Adding value: ${val}`);
                const newValue = valueRepo.create({
                    propertyId: property.id,
                    value: val,
                    displayOrder: i,
                    isActive: true
                });
                await valueRepo.save(newValue);
            }
        }
    }
}
