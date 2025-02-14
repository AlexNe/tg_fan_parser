/*
  Warnings:

  - You are about to drop the `userstate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `userstate`;

-- CreateTable
CREATE TABLE `User_State` (
    `id` BIGINT NOT NULL,
    `state` BOOLEAN NOT NULL DEFAULT false,
    `last_time` BIGINT NOT NULL,

    INDEX `User_State_id_idx`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
