import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultDimensionsToProduct1771953820762 implements MigrationInterface {
    name = 'AddDefaultDimensionsToProduct1771953820762'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "defaultLength" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "products" ADD "defaultWidth" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "products" ADD "defaultDepth" numeric(10,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "defaultDepth"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "defaultWidth"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "defaultLength"`);
    }

}
