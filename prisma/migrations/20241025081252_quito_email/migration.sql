/*
  Warnings:

  - You are about to drop the column `balance` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Owner` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Owner_email_key";

-- AlterTable
ALTER TABLE "Owner" DROP COLUMN "balance",
DROP COLUMN "email";
