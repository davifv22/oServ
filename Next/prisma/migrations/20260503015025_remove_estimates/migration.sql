/*
  Warnings:

  - You are about to drop the column `estimateId` on the `serviceorder` table. All the data in the column will be lost.
  - You are about to drop the `serviceestimate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `serviceestimateitem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `serviceestimate` DROP FOREIGN KEY `ServiceEstimate_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `serviceestimate` DROP FOREIGN KEY `ServiceEstimate_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `serviceestimate` DROP FOREIGN KEY `ServiceEstimate_orderTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `serviceestimateitem` DROP FOREIGN KEY `ServiceEstimateItem_estimateId_fkey`;

-- DropForeignKey
ALTER TABLE `serviceestimateitem` DROP FOREIGN KEY `ServiceEstimateItem_materialId_fkey`;

-- DropForeignKey
ALTER TABLE `serviceestimateitem` DROP FOREIGN KEY `ServiceEstimateItem_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `serviceorder` DROP FOREIGN KEY `ServiceOrder_estimateId_fkey`;

-- AlterTable
ALTER TABLE `serviceorder` DROP COLUMN `estimateId`;

-- DropTable
DROP TABLE `serviceestimate`;

-- DropTable
DROP TABLE `serviceestimateitem`;
