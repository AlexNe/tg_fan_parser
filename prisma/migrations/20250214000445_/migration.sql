/*
  Warnings:

  - You are about to drop the column `text` on the `public_page` table. All the data in the column will be lost.
  - Added the required column `description` to the `public_page` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `public_page` DROP COLUMN `text`,
    ADD COLUMN `description` TEXT NOT NULL;
