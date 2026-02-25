import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * TypeORM сущность для таблицы схем компонентов
 */
@Entity('product_component_schemas')
export class ProductComponentSchemaEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'product_id' })
    productId!: number;

    @Column()
    name!: string;

    @Column({ name: 'length_formula', type: 'text' })
    lengthFormula!: string;

    @Column({ name: 'width_formula', type: 'text' })
    widthFormula!: string;

    @Column({ name: 'quantity_formula', type: 'text' })
    quantityFormula!: string;
}
