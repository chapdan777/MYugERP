import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePriceModifiersTable1736434010000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'price_modifiers',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'modifier_type',
            type: 'varchar',
            enum: ['PERCENTAGE', 'FIXED_PRICE', 'PER_UNIT', 'MULTIPLIER', 'FIXED_AMOUNT'],
            isNullable: false,
          },
          {
            name: 'value',
            type: 'numeric',
            precision: 15,
            scale: 4,
            isNullable: false,
          },
          {
            name: 'property_id',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'property_value',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'priority',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_price_modifiers_code',
            columnNames: ['code'],
          },
          {
            name: 'IDX_price_modifiers_is_active',
            columnNames: ['is_active'],
          },
          {
            name: 'IDX_price_modifiers_property_id',
            columnNames: ['property_id'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('price_modifiers', true);
  }
}