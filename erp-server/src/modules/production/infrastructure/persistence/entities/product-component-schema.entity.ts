import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * TypeORM сущность для таблицы схем компонентов
 * @description Поддерживает рекурсивную вложенность через child_product_id
 */
@Entity('product_component_schemas')
export class ProductComponentSchemaEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'product_id' })
    productId!: number;

    /** Ссылка на дочернюю номенклатуру (null = простая деталь без вложенности) */
    @Column({ name: 'child_product_id', type: 'int', nullable: true })
    childProductId!: number | null;

    @Column()
    name!: string;

    @Column({ name: 'length_formula', type: 'text' })
    lengthFormula!: string;

    @Column({ name: 'width_formula', type: 'text' })
    widthFormula!: string;

    @Column({ name: 'quantity_formula', type: 'text' })
    quantityFormula!: string;

    /** Формула глубины (D) дочернего элемента */
    @Column({ name: 'depth_formula', type: 'text', nullable: true })
    depthFormula!: string | null;

    /** Дополнительные переменные для передачи в контекст дочернего элемента */
    @Column({ name: 'extra_variables', type: 'jsonb', nullable: true })
    extraVariables!: Record<string, string> | null;

    /** Формула условия включения компонента (например, "ПРИКЛЕЙКА_ДЕКОРА == 'true'") */
    @Column({ name: 'condition_formula', type: 'text', nullable: true })
    conditionFormula!: string | null;

    /** Порядок сортировки */
    @Column({ name: 'sort_order', type: 'int', default: 0 })
    sortOrder!: number;
}
