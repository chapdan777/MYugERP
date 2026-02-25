import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultValueToProductProperties1738765200000 implements MigrationInterface {
    name = 'AddDefaultValueToProductProperties1738765200000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "product_properties" ADD COLUMN "defaultValue" VARCHAR(255) NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "product_properties" DROP COLUMN "defaultValue"`,
        );
    }
}
