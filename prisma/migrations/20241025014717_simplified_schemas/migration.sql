-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "normalizedSize" DROP NOT NULL,
ALTER COLUMN "reserved" DROP NOT NULL,
ALTER COLUMN "size" DROP NOT NULL,
ALTER COLUMN "sold" DROP NOT NULL,
ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "userName" DROP NOT NULL,
ALTER COLUMN "userPhone" DROP NOT NULL;
