/*
  Warnings:

  - Added the required column `price` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "color" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;
