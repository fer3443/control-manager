-- DropIndex
DROP INDEX "public"."Brand_name_key";

-- DropIndex
DROP INDEX "public"."Category_name_key";

-- AlterTable
ALTER TABLE "public"."Brand" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "Brand_name_userId_idx" ON "public"."Brand"("name", "userId");

-- CreateIndex
CREATE INDEX "Brand_userId_idx" ON "public"."Brand"("userId");

-- CreateIndex
CREATE INDEX "Category_name_userId_idx" ON "public"."Category"("name", "userId");

-- CreateIndex
CREATE INDEX "Category_userId_idx" ON "public"."Category"("userId");

-- AddForeignKey
ALTER TABLE "public"."Brand" ADD CONSTRAINT "Brand_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
