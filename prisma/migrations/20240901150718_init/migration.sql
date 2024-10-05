-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "talle" TEXT NOT NULL,
    "talleNumero" INTEGER NOT NULL,
    "dueno" TEXT NOT NULL,
    "reservado" BOOLEAN NOT NULL,
    "vendido" BOOLEAN NOT NULL,
    "imagenes" TEXT[],

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);
