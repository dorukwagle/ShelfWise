-- AlterTable
ALTER TABLE `Memberships` ADD COLUMN `lastRenewalDate` TIMESTAMP NULL,
    ADD COLUMN `renewalCount` INTEGER NULL DEFAULT 0,
    ADD COLUMN `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active';
