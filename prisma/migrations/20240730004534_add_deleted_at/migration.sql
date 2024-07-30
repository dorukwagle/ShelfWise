/*
  Warnings:

  - You are about to alter the column `lastRenewalDate` on the `Memberships` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- AlterTable
ALTER TABLE `BookWithAuthors` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `BookWithGenres` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Memberships` ADD COLUMN `deletedAt` DATETIME(3) NULL,
    MODIFY `lastRenewalDate` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `Sessions` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Users` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `isbns` ADD COLUMN `deletedAt` DATETIME(3) NULL;
