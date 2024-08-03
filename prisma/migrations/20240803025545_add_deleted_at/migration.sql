/*
  Warnings:

  - You are about to alter the column `lastRenewalDate` on the `Memberships` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- AlterTable
ALTER TABLE `Memberships` MODIFY `lastRenewalDate` TIMESTAMP NULL;
