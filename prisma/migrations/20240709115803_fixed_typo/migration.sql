/*
  Warnings:

  - You are about to drop the column `roll_number` on the `Users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rollNumber]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rollNumber` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Users_roll_number_key` ON `Users`;

-- AlterTable
ALTER TABLE `Users` DROP COLUMN `roll_number`,
    ADD COLUMN `rollNumber` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Users_rollNumber_key` ON `Users`(`rollNumber`);
