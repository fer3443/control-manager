-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'SUPERUSER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."UnitMeasure" AS ENUM ('UNIT', 'GRAM', 'KILOGRAM', 'LITER', 'METER', 'BOX', 'PACKAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."StockMovementType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "description" TEXT,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "currentStock" INTEGER NOT NULL,
    "unitMeasure" "public"."UnitMeasure" NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL,
    "salePrice" DOUBLE PRECISION NOT NULL,
    "profitMargin" DOUBLE PRECISION,
    "expiresDate" TIMESTAMP(3),
    "barcode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "supplierId" TEXT,
    "userId" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StockMovement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "public"."StockMovementType" NOT NULL,
    "unitCost" DOUBLE PRECISION,
    "unitSalePrice" DOUBLE PRECISION,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performedById" TEXT,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "businessName" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserConfig" (
    "id" TEXT NOT NULL,
    "alertsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "currency" TEXT,
    "profitMarginPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "daysBeforeExpiryAlert" INTEGER NOT NULL DEFAULT 7,
    "stockAlertEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_barcode_key" ON "public"."Product"("barcode");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "public"."Product"("name");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "public"."Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_brandId_idx" ON "public"."Product"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_barcode_userId_key" ON "public"."Product"("barcode", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "public"."Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "public"."Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserConfig_userId_key" ON "public"."UserConfig"("userId");

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockMovement" ADD CONSTRAINT "StockMovement_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserConfig" ADD CONSTRAINT "UserConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
