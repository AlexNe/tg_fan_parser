/*
  Warnings:

  - You are about to drop the column `chat_name` on the `chat` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `chat` table. All the data in the column will be lost.
  - Added the required column `description` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Chat_chat_name_idx` ON `chat`;

-- AlterTable
ALTER TABLE `chat` DROP COLUMN `chat_name`,
    DROP COLUMN `text`,
    ADD COLUMN `autoread` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `description` TEXT NOT NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Chat_title_idx` ON `Chat`(`title`);
