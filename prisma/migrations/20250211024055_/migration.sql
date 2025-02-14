/*
  Warnings:

  - You are about to drop the column `is_online` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `last_online` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `is_online`,
    DROP COLUMN `last_online`;
