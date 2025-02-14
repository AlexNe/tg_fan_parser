-- DropIndex
DROP INDEX `Message_createdAt_idx` ON `message`;

-- CreateIndex
CREATE INDEX `Chat_chat_id_idx` ON `Chat`(`chat_id`);

-- CreateIndex
CREATE INDEX `Chat_chat_name_idx` ON `Chat`(`chat_name`);

-- CreateIndex
CREATE INDEX `Post_id_idx` ON `Post`(`id`);

-- CreateIndex
CREATE INDEX `Post_message_id_idx` ON `Post`(`message_id`);

-- CreateIndex
CREATE INDEX `public_page_chat_id_idx` ON `public_page`(`chat_id`);

-- CreateIndex
CREATE INDEX `public_page_title_idx` ON `public_page`(`title`);

-- CreateIndex
CREATE INDEX `User_id_idx` ON `User`(`id`);

-- CreateIndex
CREATE INDEX `User_username_idx` ON `User`(`username`);

-- CreateIndex
CREATE INDEX `User_phone_idx` ON `User`(`phone`);
