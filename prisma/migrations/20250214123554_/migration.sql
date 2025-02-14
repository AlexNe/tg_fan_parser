-- AlterTable
ALTER TABLE `message` ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `post` ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false;
