import prisma from "../database"
import Telegram from "../telegram"
import { DataDefaults, model_channel, model_chat, model_message, model_post, user, user_state } from "./interfaces"

export default class TelegramDb {
    telegram: Telegram

    constructor(telegram: Telegram) {
        this.telegram = telegram
    }

    async user(user_id: bigint, data: user | undefined = undefined): Promise<user | null> {
        const user_count = await prisma.user.count({ where: { id: user_id } })
        if (user_count == 0 && data == undefined) return await this.telegram.getUser(user_id)
        if (user_count == 0 && data != undefined) {
            data["id"] = user_id
            return await prisma.user.create({ data: data as any })
        } else {
            const user_db = await prisma.user.findUnique({ where: { id: user_id } })
            if (data != undefined) {
                let new_data: { [id: string]: any } = {}
                if (data.first_name != user_db?.first_name) new_data.first_name = data.first_name
                if (data.last_name != null && data.last_name != user_db?.last_name) new_data.last_name = data.last_name
                if (data.phone != null && data.phone != user_db?.phone) new_data.phone = data.phone
                if (data.username != null && data.username != user_db?.username) new_data.username = data.username
                if (Object.keys(new_data).length > 0)
                    return await prisma.user.update({ data: data as any, where: { id: user_id } })
                return data
            }
            return user_db
        }
    }

    async user_status(user_id: bigint, state: boolean | null, time: bigint): Promise<user_state | null> {
        let result: user_state = DataDefaults.user_state
        const ucount = await prisma.user_state.count({
            where: { id: user_id },
        });
        if (ucount == 0 && state == null) return null;

        try {
            if (state == null && ucount > 0) {
                const db_state = await prisma.user_state.findUnique({ where: { id: user_id } })
                if (db_state != null) {
                    // result.state = db_state["state"]
                    // result.last_time = db_state["last_time"]
                    return db_state as user_state
                } else return null
            } else {
                if (ucount == 0) {
                    const user = await prisma.user_state.create({
                        data: { id: user_id, state: state ?? false, last_time: time },
                    });
                    console.log("✅ user_status created:", user);
                } else {
                    const user = await prisma.user_state.update({
                        data: { state: state ?? false, last_time: time },
                        where: { id: user_id }
                    });
                    // console.log("✅ user_status updated:", user);
                }
                return result
            }
        } catch (error) {
            console.error("❌ Error in DB (user_status):", error);
            return null;
        }
    }

    // groups supergroups(channels)
    async ChatMessage(chat_id: bigint, message_id: bigint, message: model_message|undefined = undefined) { //: Promise<user_state|null> {
        const driver = prisma.message
        const db_count = await driver.count({ where: { chat_id, message_id }, });
        let db_data:model_message = DataDefaults.model_message;
        try {
            if (db_count == 0) {
                try {
                    db_data = await driver.create({ data: message as any, });
                } catch(e:any) {
                    if(e.code == "P2002") this.ChatMessage(chat_id, message_id, message)
                }
                // console.log("✅ message created:", db_data);
            }
            if (db_count > 0) db_data = await driver.findFirst({ where: { chat_id, message_id } }) as model_message
            if(message != undefined && db_count > 0) {
                let update: {[id:string]: any} = {}
                if( db_data.text != message.text) { db_data.text = update.text = message.text }
                db_data = await driver.update({ data: update, where: { id : db_data.id  }
                });
                // console.log("✅ message updated:", user);
            }
            return db_data
        } catch (error) {
            console.error("❌ Error in DB (message):", error);
            console.error({db_count,message})
            return null;
        }
    }

    // public pages (channels type too)
    async ChannelMessage(chat_id: bigint, message_id: bigint, post: model_post|undefined = undefined) {
        const driver = prisma.post
        const db_count = await driver.count({ where: { chat_id, message_id }, });
        let db_data:model_post = DataDefaults.model_post;
        try {
            if (db_count == 0) {
                try {
                    db_data = await driver.create({ data: post as any, });
                } catch(e:any) {
                    if(e.code == "P2002") this.ChannelMessage(chat_id, message_id, post)
                }
                // console.log("✅ post created:", db_data);
            }
            if (db_count > 0) db_data = await driver.findFirst({ where: { chat_id, message_id } }) as model_post
            if (post != undefined && db_count > 0) {
                let new_data: {[id:string]: any} = {}
                if( db_data.text != post.text) { db_data.text = new_data.text = post.text }
                if( db_data.media != post.media) { db_data.media = new_data.media = post.media }
                if( db_data.views != post.views) { db_data.views = new_data.views = post.views }
                if (Object.keys(new_data).length > 0)
                db_data = await driver.update({ data: new_data, where: { id : db_data.id  } });
                // console.log("✅ message updated:", user);
            }
            return db_data
        } catch (error) {
            console.error("❌ Error in DB (message):", error);
            console.error({db_count,post})
            return null;
        }
    }

    async channel(chat_id: bigint, data: model_channel | undefined = undefined): Promise<model_channel | null> {
        const driver = prisma.public_page
        const db_count = await driver.count({ where: { chat_id }, });
        if (db_count == 0 && data != undefined) {
            data["chat_id"] = chat_id
            return await driver.create({ data: data as any })
        } else {
            const db_data = await driver.findUnique({ where: { chat_id } })
            if (data != undefined && db_data != null) {
                let new_data: { [id: string]: any } = {}
                if (data.title != db_data?.title) db_data.title = new_data.title = data.title
                if (data.description != db_data?.description) db_data.description = (new_data.description = data.description) as any
                if (data.title != db_data?.title) db_data.title = new_data.title = data.title
                if (Object.keys(new_data).length > 0)
                    return await driver.update({ data: data as any, where: { chat_id } })
                return data
            }
            return db_data
        }
    }

    async chat(chat_id: bigint, data: model_chat | undefined = undefined): Promise<model_chat | null> {
        const driver = prisma.chat
        const db_count = await driver.count({ where: { chat_id }, });
        if (db_count == 0 && data != undefined) {
            data["chat_id"] = chat_id
            return await driver.create({ data: data as any })
        } else {
            const db_data = await driver.findUnique({ where: { chat_id } })
            if (data != undefined && db_data != null) {
                let new_data: { [id: string]: any } = {}
                if (data.title != db_data?.title) db_data.title = new_data.title = data.title
                if (data.description != db_data?.description) db_data.description = (new_data.description = data.description) as any
                if (data.title != db_data?.title) db_data.title = new_data.title = data.title
                if (Object.keys(new_data).length > 0)
                    return await driver.update({ data: data as any, where: { chat_id } })
                return data
            }
            return db_data
        }
    }

    async setMessageDelete(chat_id: bigint, message_id: bigint) {
        try {
            return await prisma.message.updateMany({ data: { is_deleted: true }, where: { chat_id, message_id} })
        } catch { }
        try {
            return await prisma.post.updateMany({ data: { is_deleted: true }, where: { chat_id, message_id} })
        } catch { }
    }

}