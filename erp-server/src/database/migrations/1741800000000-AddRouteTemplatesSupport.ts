import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Миграция для добавления поддержки шаблонов маршрутов
 */
export class AddRouteTemplatesSupport1741800000000 implements MigrationInterface {
    name = 'AddRouteTemplatesSupport1741800000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Добавляем флаг шаблона в таблицу маршрутов
        await queryRunner.query(`
            ALTER TABLE "technological_routes" 
            ADD COLUMN IF NOT EXISTS "is_template" boolean NOT NULL DEFAULT false
        `);

        // Делаем productId необязательным (для шаблонов)
        await queryRunner.query(`
            ALTER TABLE "technological_routes" 
            ALTER COLUMN "product_id" DROP NOT NULL
        `);

        // Добавляем ссылку на шаблон маршрута в таблицу продуктов
        await queryRunner.query(`
            ALTER TABLE "products" 
            ADD COLUMN IF NOT EXISTS "route_template_id" integer NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "route_template_id"`);
        await queryRunner.query(`ALTER TABLE "technological_routes" DROP COLUMN IF EXISTS "is_template"`);
    }
}
