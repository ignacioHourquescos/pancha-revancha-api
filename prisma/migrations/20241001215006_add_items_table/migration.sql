/*
  Warnings:

  - You are about to drop the column `descripcion` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `dueno` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `imagenes` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `reservado` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `talle` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `talleNumero` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `vendido` on the `Item` table. All the data in the column will be lost.
  - Added the required column `description` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `normalizedSize` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reserved` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sold` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "descripcion",
DROP COLUMN "dueno",
DROP COLUMN "imagenes",
DROP COLUMN "reservado",
DROP COLUMN "talle",
DROP COLUMN "talleNumero",
DROP COLUMN "vendido",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "iamges" TEXT[],
ADD COLUMN     "normalizedSize" INTEGER NOT NULL,
ADD COLUMN     "owner" TEXT NOT NULL,
ADD COLUMN     "reserved" BOOLEAN NOT NULL,
ADD COLUMN     "size" TEXT NOT NULL,
ADD COLUMN     "sold" BOOLEAN NOT NULL;
