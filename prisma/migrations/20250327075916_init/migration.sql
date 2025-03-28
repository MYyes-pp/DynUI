-- CreateTable
CREATE TABLE `Task` (
    `id` VARCHAR(191) NOT NULL,
    `taskDesc` TEXT NOT NULL,
    `taskType` ENUM('CONFIRM_INFORMATION', 'LACK_INFORMATION') NOT NULL,
    `taskData` JSON NOT NULL,
    `callbackURL` VARCHAR(191) NOT NULL,
    `uiUrl` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `generatedCode` TEXT NULL,
    `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` DATETIME(6) NOT NULL,

    INDEX `Task_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DataSubmission` (
    `id` VARCHAR(191) NOT NULL,
    `taskId` VARCHAR(191) NOT NULL,
    `submittedData` JSON NOT NULL,
    `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` DATETIME(6) NOT NULL,

    INDEX `DataSubmission_taskId_idx`(`taskId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DataSubmission` ADD CONSTRAINT `DataSubmission_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
