/*
  Warnings:

  - You are about to drop the column `userName` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `userPhone` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "userName",
DROP COLUMN "userPhone",
ADD COLUMN     "likes" INTEGER;
