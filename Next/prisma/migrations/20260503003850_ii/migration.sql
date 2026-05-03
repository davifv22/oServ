-- DropForeignKey
ALTER TABLE `serviceestimateitem` DROP FOREIGN KEY `ServiceEstimateItem_estimateId_fkey`;

-- DropForeignKey
ALTER TABLE `serviceorderboleto` DROP FOREIGN KEY `ServiceOrderBoleto_invoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `serviceorderinvoice` DROP FOREIGN KEY `ServiceOrderInvoice_serviceOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `serviceorderitem` DROP FOREIGN KEY `ServiceOrderItem_serviceOrderId_fkey`;

-- AddForeignKey
ALTER TABLE `ServiceEstimateItem` ADD CONSTRAINT `ServiceEstimateItem_estimateId_fkey` FOREIGN KEY (`estimateId`) REFERENCES `ServiceEstimate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceOrderItem` ADD CONSTRAINT `ServiceOrderItem_serviceOrderId_fkey` FOREIGN KEY (`serviceOrderId`) REFERENCES `ServiceOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceOrderInvoice` ADD CONSTRAINT `ServiceOrderInvoice_serviceOrderId_fkey` FOREIGN KEY (`serviceOrderId`) REFERENCES `ServiceOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceOrderBoleto` ADD CONSTRAINT `ServiceOrderBoleto_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `ServiceOrderInvoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
