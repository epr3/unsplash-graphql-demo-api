import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateDatabase1556637805631 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "user" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "image" ("id" varchar PRIMARY KEY NOT NULL, "unsplashId" varchar NOT NULL, "albumId" varchar)`);
        await queryRunner.query(`CREATE TABLE "album" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "userId" varchar)`);
        await queryRunner.query(`CREATE TABLE "temporary_image" ("id" varchar PRIMARY KEY NOT NULL, "unsplashId" varchar NOT NULL, "albumId" varchar, CONSTRAINT "FK_cc59166e5aeebd9acea0abd845c" FOREIGN KEY ("albumId") REFERENCES "album" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_image"("id", "unsplashId", "albumId") SELECT "id", "unsplashId", "albumId" FROM "image"`);
        await queryRunner.query(`DROP TABLE "image"`);
        await queryRunner.query(`ALTER TABLE "temporary_image" RENAME TO "image"`);
        await queryRunner.query(`CREATE TABLE "temporary_album" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "userId" varchar, CONSTRAINT "FK_815bbf84cb5e82a56c85294d0fe" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_album"("id", "name", "userId") SELECT "id", "name", "userId" FROM "album"`);
        await queryRunner.query(`DROP TABLE "album"`);
        await queryRunner.query(`ALTER TABLE "temporary_album" RENAME TO "album"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "album" RENAME TO "temporary_album"`);
        await queryRunner.query(`CREATE TABLE "album" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "userId" varchar)`);
        await queryRunner.query(`INSERT INTO "album"("id", "name", "userId") SELECT "id", "name", "userId" FROM "temporary_album"`);
        await queryRunner.query(`DROP TABLE "temporary_album"`);
        await queryRunner.query(`ALTER TABLE "image" RENAME TO "temporary_image"`);
        await queryRunner.query(`CREATE TABLE "image" ("id" varchar PRIMARY KEY NOT NULL, "unsplashId" varchar NOT NULL, "albumId" varchar)`);
        await queryRunner.query(`INSERT INTO "image"("id", "unsplashId", "albumId") SELECT "id", "unsplashId", "albumId" FROM "temporary_image"`);
        await queryRunner.query(`DROP TABLE "temporary_image"`);
        await queryRunner.query(`DROP TABLE "album"`);
        await queryRunner.query(`DROP TABLE "image"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
