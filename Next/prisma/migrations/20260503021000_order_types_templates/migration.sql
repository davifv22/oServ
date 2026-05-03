-- AlterTable
ALTER TABLE `ServiceEstimate`
  ADD COLUMN `orderTypeId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ServiceOrderType` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `defaultPriority` ENUM('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `ServiceOrderType_companyId_name_key`(`companyId`, `name`),
  INDEX `ServiceOrderType_companyId_idx`(`companyId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceOrderTypeItem` (
  `id` VARCHAR(191) NOT NULL,
  `orderTypeId` VARCHAR(191) NOT NULL,
  `itemType` ENUM('SERVICE','MATERIAL') NOT NULL,
  `serviceId` VARCHAR(191) NULL,
  `materialId` VARCHAR(191) NULL,
  `description` VARCHAR(191) NULL,
  `quantity` DOUBLE NOT NULL DEFAULT 1,
  `unitPrice` DOUBLE NOT NULL DEFAULT 0,
  `total` DOUBLE NOT NULL DEFAULT 0,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `ServiceOrderTypeItem_orderTypeId_idx`(`orderTypeId`),
  INDEX `ServiceOrderTypeItem_serviceId_idx`(`serviceId`),
  INDEX `ServiceOrderTypeItem_materialId_idx`(`materialId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ServiceEstimate_orderTypeId_idx` ON `ServiceEstimate`(`orderTypeId`);

-- AddForeignKey
ALTER TABLE `ServiceOrderType`
  ADD CONSTRAINT `ServiceOrderType_companyId_fkey`
  FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceOrderTypeItem`
  ADD CONSTRAINT `ServiceOrderTypeItem_orderTypeId_fkey`
  FOREIGN KEY (`orderTypeId`) REFERENCES `ServiceOrderType`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceOrderTypeItem`
  ADD CONSTRAINT `ServiceOrderTypeItem_serviceId_fkey`
  FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceOrderTypeItem`
  ADD CONSTRAINT `ServiceOrderTypeItem_materialId_fkey`
  FOREIGN KEY (`materialId`) REFERENCES `Material`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceEstimate`
  ADD CONSTRAINT `ServiceEstimate_orderTypeId_fkey`
  FOREIGN KEY (`orderTypeId`) REFERENCES `ServiceOrderType`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
