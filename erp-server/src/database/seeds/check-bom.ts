import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { ProductComponentSchemaEntity } from '../../modules/production/infrastructure/persistence/entities/product-component-schema.entity';
import { ProductEntity } from '../../modules/products/infrastructure/persistence/product.entity';
import { ProductPropertyEntity } from '../../modules/products/infrastructure/persistence/product-property.entity';

dotenv.config();

async function check() {
    const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        username: process.env.DATABASE_USERNAME || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: process.env.DATABASE_NAME || 'erp_db',
        entities: [
            ProductComponentSchemaEntity,
            ProductEntity,
            ProductPropertyEntity
        ],
        synchronize: false,
    });

    await dataSource.initialize();
    
    const productName = 'Фасад рамочный';
    const product = await dataSource.getRepository(ProductEntity).findOne({
        where: { name: productName }
    });

    if (!product) {
        console.log(`Product "${productName}" not found.`);
    } else {
        console.log(`Checking Product ID: ${product.id} (${product.name})`);
        
        // 1. Check schemas
        const schemas = await dataSource.getRepository(ProductComponentSchemaEntity).find({
            where: { productId: product.id }
        });
        console.log(`BOM Schemas (${schemas.length})`);

        // 2. Check property links
        const productProps = await dataSource.getRepository(ProductPropertyEntity).find({
            where: { productId: product.id }
        });
        console.log(`Linked Properties IDs for Product ${product.id}:`, productProps.map(pp => pp.propertyId));
        
        if (productProps.length === 0) {
            console.log('!!! CRITICAL: Product has NO PROPERTIES linked in product_properties table.');
        } else {
            productProps.forEach(pp => {
                console.log(`  - Property ID ${pp.propertyId}: default=${pp.defaultValue}, isActive=${pp.isActive}`);
            });
        }
    }

    await dataSource.destroy();
}

check().catch(console.error);
