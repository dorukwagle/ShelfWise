/*
  Warnings:

  - You are about to alter the column `lastRenewalDate` on the `Memberships` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - Added the required column `role` to the `Sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rolePrecedence` to the `Sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Memberships` MODIFY `lastRenewalDate` TIMESTAMP NULL;

-- AlterTable
ALTER TABLE `Sessions` ADD COLUMN `role` ENUM('Member', 'Coordinator', 'AssistantManager', 'Manager') NOT NULL,
    ADD COLUMN `rolePrecedence` INTEGER NOT NULL;
