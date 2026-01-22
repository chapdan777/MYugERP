import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePropertyValuesTable1768917691040 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'property_values',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'property_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'value',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'price_modifier_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'display_order',
            type: 'int',
            default: 0,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
            onUpdate: 'now()',
          },
        ],
      }),
      true,
    );

    // Добавляем уникальный индекс на property_id и value
    await queryRunner.query(
      'CREATE UNIQUE INDEX IDX_PROPERTY_VALUES_PROPERTY_ID_VALUE ON property_values (property_id, value) WHERE is_active = true',
    );

    // Добавляем внешние ключи
    await queryRunner.createForeignKey(
      'property_values',
      new TableForeignKey({
        columnNames: ['property_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'properties',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'property_values',
      new TableForeignKey({
        columnNames: ['price_modifier_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'price_modifiers',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('property_values', 'FK_property_values_property_id');
    await queryRunner.dropForeignKey('property_values', 'FK_property_values_price_modifier_id');
    await queryRunner.dropIndex('property_values', 'IDX_PROPERTY_VALUES_PROPERTY_ID_VALUE');
    await queryRunner.dropTable('property_values', true);
  }
}
