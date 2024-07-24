/*
  Warnings:

  - You are about to alter the column `lastRenewalDate` on the `Memberships` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to drop the column `membershipId` on the `Users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Memberships` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Memberships` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Users` DROP FOREIGN KEY `Users_membershipId_fkey`;

-- AlterTable
ALTER TABLE `Memberships` ADD COLUMN `userId` VARCHAR(191) NOT NULL,
    MODIFY `lastRenewalDate` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `Users` DROP COLUMN `membershipId`;

-- CreateIndex
CREATE UNIQUE INDEX `Memberships_userId_key` ON `Memberships`(`userId`);

-- AddForeignKey
ALTER TABLE `Memberships` ADD CONSTRAINT `Memberships_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
