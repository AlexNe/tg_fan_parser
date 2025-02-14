/*
  Warnings:

  - The primary key for the `chat` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_chat_id_fkey`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_to_id_fkey`;

-- AlterTable
ALTER TABLE `chat` DROP PRIMARY KEY,
    MODIFY `chat_id` BIGINT NOT NULL,
    ADD PRIMARY KEY (`chat_id`);

-- AlterTable
ALTER TABLE `message` MODIFY `chat_id` BIGINT NOT NULL,
    MODIFY `to_id` BIGINT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `phone` VARCHAR(191) NULL,
    MODIFY `last_name` VARCHAR(100) NULL,
    MODIFY `username` VARCHAR(100) NULL;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_to_id_fkey` FOREIGN KEY (`to_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_chat_id_fkey` FOREIGN KEY (`chat_id`) REFERENCES `Chat`(`chat_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
