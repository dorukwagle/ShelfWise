/*
  Warnings:

  - Made the column `contactNo` on table `Users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Users` DROP FOREIGN KEY `Users_membershipId_fkey`;

-- AlterTable
ALTER TABLE `MembershipTypes` MODIFY `type` ENUM('Employee', 'Staff', 'Faculty', 'Tutor') NOT NULL;

-- AlterTable
ALTER TABLE `Users` MODIFY `contactNo` VARCHAR(191) NOT NULL,
    MODIFY `membershipId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_membershipId_fkey` FOREIGN KEY (`membershipId`) REFERENCES `Memberships`(`membershipId`) ON DELETE SET NULL ON UPDATE CASCADE;
