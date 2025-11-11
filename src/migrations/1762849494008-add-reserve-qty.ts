import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReserveQty1762849494008 implements MigrationInterface {
    name = 'AddReserveQty1762849494008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" ADD "reserveQty" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "reserveQty"`);
    }

}
