/*
  Warnings:

  - You are about to alter the column `lastRenewalDate` on the `Memberships` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- DropIndex
DROP INDEX `Genres_genre_idx` ON `Genres`;

-- AlterTable
ALTER TABLE `Memberships` MODIFY `lastRenewalDate` TIMESTAMP NULL;

-- CreateIndex
CREATE FULLTEXT INDEX `Genres_genre_idx` ON `Genres`(`genre`);

-- CreateIndex
CREATE FULLTEXT INDEX `Publishers_publisherName_idx` ON `Publishers`(`publisherName`);
