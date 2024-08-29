/*
  Warnings:

  - You are about to alter the column `lastRenewalDate` on the `Memberships` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - Added the required column `userId` to the `BookReservations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `BookReservations` ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Issues` ADD COLUMN `status` ENUM('Active', 'Returned') NOT NULL DEFAULT 'Active';

-- AlterTable
ALTER TABLE `Memberships` MODIFY `lastRenewalDate` TIMESTAMP NULL;

-- AddForeignKey
ALTER TABLE `BookReservations` ADD CONSTRAINT `BookReservations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
