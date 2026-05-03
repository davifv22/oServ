-- DropForeignKey
ALTER TABLE `Vehicle` DROP FOREIGN KEY `Vehicle_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `ServiceEstimate` DROP FOREIGN KEY `ServiceEstimate_vehicleId_fkey`;

-- AlterTable
ALTER TABLE `Vehicle`
  DROP COLUMN `customerId`;

-- AlterTable
ALTER TABLE `ServiceEstimate`
  DROP COLUMN `vehicleId`;

-- AlterTable
ALTER TABLE `ServiceOrder`
  ADD COLUMN `travelCost` DOUBLE NOT NULL DEFAULT 0;
