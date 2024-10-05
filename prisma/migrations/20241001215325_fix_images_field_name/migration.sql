/*
  Warnings:

  - You are about to drop the column `iamges` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "iamges",
ADD COLUMN     "images" TEXT[];
