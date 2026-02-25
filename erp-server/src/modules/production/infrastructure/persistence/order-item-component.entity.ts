import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('order_item_components')
export class OrderItemComponentEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    orderItemId!: number;

    @Column({ length: 255 })
    name!: string;

    @Column('float')
    length!: number;

    @Column('float')
    width!: number;

    @Column('float')
    quantity!: number;

    @Column({ type: 'jsonb', nullable: true })
    formulaContext!: any;
}
