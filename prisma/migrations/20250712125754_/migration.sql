/*
  Warnings:

  - You are about to drop the column `created_at` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `order_items` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "unit" AS ENUM ('g', 'kg', '袋', '本', '枚', '巻', '個', '冊', '式', '束', '台', '箱', '粒', 'ケース', 'セット', 'バルク', 'ロット');

-- CreateEnum
CREATE TYPE "orderItemType" AS ENUM ('食材', '商品', '資材', '特殊');

-- CreateEnum
CREATE TYPE "holiday" AS ENUM ('月', '火', '水', '木', '金', '土', '日');

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_order_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_product_id_fkey";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "created_at",
ADD COLUMN     "holiday" "holiday",
ADD COLUMN     "order_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "other_delivery_address" TEXT,
ADD COLUMN     "request_message" TEXT;

-- DropTable
DROP TABLE "order_items";

-- CreateTable
CREATE TABLE "AnnualTarget" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "store_id" INTEGER NOT NULL,
    "target_sales_amount" DECIMAL(12,2) NOT NULL,
    "target_customer_count" INTEGER NOT NULL,
    "target_total_items_sold" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "AnnualTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyTarget" (
    "id" SERIAL NOT NULL,
    "annual_target_id" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "allocation_percentage" DECIMAL(5,4) NOT NULL,
    "target_sales_amount" DECIMAL(12,2) NOT NULL,
    "target_customer_count" INTEGER NOT NULL,
    "target_total_items_sold" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "MonthlyTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyTarget" (
    "id" SERIAL NOT NULL,
    "monthly_target_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "target_sales_amount" DECIMAL(12,2) NOT NULL,
    "target_customer_count" INTEGER NOT NULL,
    "target_total_items_sold" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "WeeklyTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyTarget" (
    "id" SERIAL NOT NULL,
    "weekly_target_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "target_sales_amount" DECIMAL(12,2) NOT NULL,
    "target_customer_count" INTEGER NOT NULL,
    "target_total_items_sold" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "DailyTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "inspection_standard" INTEGER NOT NULL,
    "inspection_unit" "unit" NOT NULL,
    "manufacturable_quantity" INTEGER NOT NULL,
    "manufacturable_unit" "unit" NOT NULL,
    "manufacturing_cost_per_piece" DECIMAL(10,2),
    "packaging_cost_per_piece" DECIMAL(10,2),
    "product_cost_per_piece" DECIMAL(10,2),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipeItem" (
    "id" SERIAL NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "recipeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item" (
    "id" SERIAL NOT NULL,
    "type" "orderItemType" NOT NULL,
    "name" TEXT NOT NULL,
    "unit" "unit" NOT NULL,
    "minimum_order_quantity" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orderItem" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "ordersId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,

    CONSTRAINT "orderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnnualTarget_year_store_id_key" ON "AnnualTarget"("year", "store_id");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyTarget_annual_target_id_month_key" ON "MonthlyTarget"("annual_target_id", "month");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyTarget_monthly_target_id_start_date_key" ON "WeeklyTarget"("monthly_target_id", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyTarget_weekly_target_id_date_key" ON "DailyTarget"("weekly_target_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_product_id_key" ON "recipe"("product_id");

-- AddForeignKey
ALTER TABLE "AnnualTarget" ADD CONSTRAINT "AnnualTarget_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyTarget" ADD CONSTRAINT "MonthlyTarget_annual_target_id_fkey" FOREIGN KEY ("annual_target_id") REFERENCES "AnnualTarget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyTarget" ADD CONSTRAINT "WeeklyTarget_monthly_target_id_fkey" FOREIGN KEY ("monthly_target_id") REFERENCES "MonthlyTarget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTarget" ADD CONSTRAINT "DailyTarget_weekly_target_id_fkey" FOREIGN KEY ("weekly_target_id") REFERENCES "WeeklyTarget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe" ADD CONSTRAINT "recipe_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipeItem" ADD CONSTRAINT "recipeItem_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipeItem" ADD CONSTRAINT "recipeItem_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderItem" ADD CONSTRAINT "orderItem_ordersId_fkey" FOREIGN KEY ("ordersId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderItem" ADD CONSTRAINT "orderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
