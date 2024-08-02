/*
  Warnings:

  - You are about to alter the column `lastRenewalDate` on the `Memberships` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - Made the column `coverPhoto` on table `BookInfo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `BookInfo` MODIFY `publicationYear` VARCHAR(191) NOT NULL,
    MODIFY `coverPhoto` VARCHAR(2050) NOT NULL;

-- AlterTable
ALTER TABLE `MembershipTypes` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Memberships` MODIFY `lastRenewalDate` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `UserRoles` ADD COLUMN `deletedAt` DATETIME(3) NULL;
