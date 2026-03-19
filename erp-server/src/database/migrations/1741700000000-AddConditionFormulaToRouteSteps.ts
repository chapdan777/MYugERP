import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Добавление колонки condition_formula в таблицу route_steps
 * Эта колонка хранит формулу-условие для шага маршрута.
 * Если формула вычисляется в 0/false — шаг пропускается при генерации ЗН.
 */
export class AddConditionFormulaToRouteSteps1741700000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE route_steps
            ADD COLUMN IF NOT EXISTS condition_formula TEXT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE route_steps
            DROP COLUMN IF EXISTS condition_formula
        `);
    }
}
