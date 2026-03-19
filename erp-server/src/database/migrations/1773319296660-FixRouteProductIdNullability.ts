import { MigrationInterface, QueryRunner } from "typeorm";

export class FixRouteProductIdNullability1773319296660 implements MigrationInterface {
    name = 'FixRouteProductIdNullability1773319296660'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Гарантируем, что product_id может быть NULL (нужно для шаблонов)
        await queryRunner.query(`
            ALTER TABLE "technological_routes" 
            ALTER COLUMN "product_id" DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "technological_routes" 
            ALTER COLUMN "product_id" SET NOT NULL
        `);
    }

}
