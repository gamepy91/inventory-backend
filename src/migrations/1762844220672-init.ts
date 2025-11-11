import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1762844220672 implements MigrationInterface {
    name = 'Init1762844220672'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "activities" ("id" SERIAL NOT NULL, "type" character varying NOT NULL, "qtyChange" integer NOT NULL, "note" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "itemId" integer, CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "items" ("id" SERIAL NOT NULL, "sku" character varying NOT NULL, "name" character varying NOT NULL, "imageUrl" character varying, "qty" integer NOT NULL DEFAULT '0', "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "warehouseId" integer, CONSTRAINT "UQ_ed4485e4da7cc242cf46db2e3a9" UNIQUE ("sku"), CONSTRAINT "PK_ba5885359424c15ca6b9e79bcf6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "warehouses" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_be9dd3cc2931f11f7440f2eeb19" UNIQUE ("name"), CONSTRAINT "PK_56ae21ee2432b2270b48867e4be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_09a27bd7ec233a9ffef6049d61f" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_3af3207205f02ed08e13607d4c7" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_3af3207205f02ed08e13607d4c7"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_09a27bd7ec233a9ffef6049d61f"`);
        await queryRunner.query(`DROP TABLE "warehouses"`);
        await queryRunner.query(`DROP TABLE "items"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
