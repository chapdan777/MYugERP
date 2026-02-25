import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductionModuleInit1769978998510 implements MigrationInterface {
    name = 'ProductionModuleInit1769978998510'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "work_order_defects" ("id" SERIAL NOT NULL, "workOrderId" integer NOT NULL, "reason" text NOT NULL, "responsibleUserId" integer, "status" character varying(50) NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "resolvedAt" TIMESTAMP, CONSTRAINT "PK_79bcb11c35308802b02e72fb5d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_item_components" ("id" SERIAL NOT NULL, "orderItemId" integer NOT NULL, "name" character varying(255) NOT NULL, "length" double precision NOT NULL, "width" double precision NOT NULL, "quantity" double precision NOT NULL, "formulaContext" jsonb, CONSTRAINT "PK_14988912cc84f0c1d267feef299" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "operation_materials" ("id" SERIAL NOT NULL, "operationId" integer NOT NULL, "materialId" integer NOT NULL, "consumptionFormula" text NOT NULL, "unit" character varying(50) NOT NULL, CONSTRAINT "PK_30ec87babc523c84242c6d97fd3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "variableName" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "variableName"`);
        await queryRunner.query(`DROP TABLE "operation_materials"`);
        await queryRunner.query(`DROP TABLE "order_item_components"`);
        await queryRunner.query(`DROP TABLE "work_order_defects"`);
    }

}
