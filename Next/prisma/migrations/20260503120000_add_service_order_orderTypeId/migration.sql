-- Add missing ServiceOrder.orderTypeId column and relation
ALTER TABLE `ServiceOrder`
  ADD COLUMN `orderTypeId` VARCHAR(191) NULL;

ALTER TABLE `ServiceOrder`
  ADD INDEX `ServiceOrder_orderTypeId_idx`(`orderTypeId`);

ALTER TABLE `ServiceOrder`
  ADD CONSTRAINT `ServiceOrder_orderTypeId_fkey`
  FOREIGN KEY (`orderTypeId`) REFERENCES `ServiceOrderType`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
