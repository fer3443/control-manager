/*
  Warnings:

  - A unique constraint covering the columns `[name,parentId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "public"."Supplier" ADD COLUMN     "companyName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_parentId_key" ON "public"."Category"("name", "parentId");

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
