import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTemporalFieldsToPriceModifiers1736435000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавляем поле startDate
    await queryRunner.addColumn(
      'price_modifiers',
      new TableColumn({
        name: 'start_date',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    // Добавляем поле endDate
    await queryRunner.addColumn(
      'price_modifiers',
      new TableColumn({
        name: 'end_date',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    // Добавляем индекс для оптимизации поиска активных временных модификаторов
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_price_modifiers_temporal" 
      ON "price_modifiers" ("start_date", "end_date", "is_active")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем индекс
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_price_modifiers_temporal"');

    // Удаляем поля
    await queryRunner.dropColumn('price_modifiers', 'end_date');
    await queryRunner.dropColumn('price_modifiers', 'start_date');
  }
}