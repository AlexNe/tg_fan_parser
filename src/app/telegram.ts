import { App } from ".";
import config from "./config";

import { Api, TelegramClient } from "telegram"
import { NewMessage } from "telegram/events"
import { StoreSession } from "telegram/sessions"
import { NewMessageEvent } from "telegram/events/NewMessage";
// import { Message } from "telegram/tl/custom/message";

import { logger } from "./logger";
import prisma from "./database";
import { toSerializable } from "./tool";
import TelegramCore from "./telegram/core";
import TelegramDb from "./telegram/db";
import { DataDefaults, model_channel, model_chat, model_message, model_post, user } from "./telegram/interfaces";
import { sleep } from "telegram/Helpers";
import { channel } from "diagnostics_channel";

export default class Telegram extends TelegramCore {
    db: TelegramDb

    constructor(app: App, name: string, api_id: number, api_hash: string, phone: string, passowrd: string) {
        super(app, name, api_id, api_hash, phone, passowrd)
        this.db = new TelegramDb(this)

    }

    async telegram_event(event: any) {
        const constructor_name = event.constructor.name
        const event_class_name = event.className
        if (constructor_name == "UpdateConnectionState") return
        if (event_class_name == "UpdateChannelUserTyping") return
        if (event_class_name == "UpdateGroupCall") return
        if (event_class_name == "UpdateGroupCallParticipants") return
        if (event_class_name == "UpdateUserStatus") { await this.UpdateUserStatus(event); return; }
        if (event_class_name == "UpdateNewChannelMessage") { await this.UpdateNewChannelMessage(event); return; }
        if (event_class_name == "UpdateEditChannelMessage") { await this.UpdateEditChannelMessage(event); return; }
        if (event_class_name == "UpdateDeleteChannelMessages") { await this.UpdateDeleteChannelMessages(event); return; }

        //

        logger.debug(`[${event.constructor.name}][${event.className}]`)


        this.test_dump_event(event)

        const message = event.message

        if (message !== undefined) {
            // console.log(message);
            const user_id = this.getUserIdFromEvent(event) as bigint
            let user_name = user_id.toString()
            if (user_id > 0 && this.ingnor_id.indexOf(user_id) === -1) {
                try {
                    const user = await this.db.user(user_id)
                    if (user != null) user_name = `${user.first_name} ${user.last_name}`
                } catch {
                    this.ingnor_id.push(user_id)
                    logger.warn(`User(${user_id}) cannot get `)
                }
            }
            logger.debug(`[${user_name}] Text: ${message.message}`)
        } // else console.log(message);
    }



    async UpdateNewChannelMessage(event: Api.UpdateNewChannelMessage) {
        const message: Api.Message = event.message as any
        if (!message.post) {
            await this.setChatMessage(message)
        } else {
            logger.debug(`[CHANEL:${message.chatId}] Post: ${message.message}`)
            await this.setPost(message)
        }
    }

    async UpdateEditChannelMessage(event: Api.UpdateEditChannelMessage) {
        const message: Api.Message = event.message as any
        // logger.debug(`UpdateEditChannelMessage ${message.chatId}-${message.id}`)
        if (!message.post) await this.setChatMessage(message)
        else await this.setPost(message)
    }

    async UpdateDeleteChannelMessages(event: Api.UpdateDeleteChannelMessages) {
        for (let message_id of event.messages) {
            await this.db.setMessageDelete(`-100${event.channelId}` as any, message_id as any)
        }
    }

    async setChatMessage(message: Api.Message) {
        const channel_peer: Api.PeerChannel = message.peerId as any
        const sender_id = message.senderId
        const receiver_id = (message.toId as Api.PeerUser).userId
        const user_peer = message.fromId as Api.PeerUser
        await this.db.ChatMessage(message.chatId as any, message.id as any, {
            chat_id: message.chatId as any,
            message_id: message.id as any,
            text: message.message,
            from_id: sender_id,
            to_id: message.chatId as any,
        } as model_message)
        const info = await this.getChat(message.peerId as Api.PeerChannel)
        let user_id: bigint = user_peer.userId as any
        let name: user = await this.getUserInfoFromMessage(message)
        let direction = message.out ? "<<<" : ">>>"
        if (497004399 == user_id as any && message.out) {
            // console.log("Out OK");
            // this.FanEditor(message)
        }
        if (!info.hide_in_console)
            logger.debug(`[Chat:${message.chatId}][${user_id}:${this.printUserName(name)}] ${direction} ${message.message}`)
        if (info.autoread)
            this.markChanelRead(message.peerId as Api.PeerChannel, message.id as any)
    }

    async FanEditor(message: Api.Message) {
        let em = this.decorateText(message.message)
        let peer = message.peerId.className == "PeerChannel"? message.peerId as Api.PeerChannel : message.peerId as Api.PeerChat
        try {
            const result = await this.client.invoke(
                new Api.messages.EditMessage({
                    peer: peer,
                    id: message.id,
                    // noWebpage: true,
                    message: em,

                    // media: new Api.InputMediaUploadedPhoto({
                    //     file: await client.uploadFile({
                    //         file: new CustomFile(
                    //             "file.bin",
                    //             fs.statSync("../file.bin").size,
                    //             "../file.bin"
                    //         ),
                    //         workers: 1,
                    //     }),

                    //     // ttlSeconds: 43,
                    // }),
                    // scheduleDate: 43,
                })
            );
        } catch (e) {
            console.error("FanEditor Error: ", e, [peer, message.id])
        }
    }
    decorateText(text:string) {
        // Символ, который будет добавляться над каждой буквой
        const diacriticalMark = '\u0324' //'\u033E'; // Combining Vertical Tilde (̾)
        // Преобразуем строку в массив символов, добавляем к каждому символу диакритический знак
        // и соединяем обратно в строку
        return Array.from(text)
            .map(char => char + diacriticalMark)
            .join('');
    }

    async getUserInfoFromMessage(message: Api.Message) {
        const channel_peer: Api.PeerChannel = message.peerId as any
        const user_peer = message.fromId as Api.PeerUser
        const sender_id = message.senderId
        const user_id: bigint = user_peer.userId as any
        let name: user = DataDefaults.user
        if (user_id > 0 && this.ingnor_id.indexOf(user_id) === -1)
            await this.getChannelParticipants(channel_peer) // Try get all users (if need)
        try {
            name = await this.db.user(user_id as any) ?? name
        } catch {
            this.ingnor_id.push(user_id) // ignore this user_id later
            try {
                const entity = await this.client.getEntity(sender_id as any) as Api.User;
                let data = {
                    id: sender_id as any,
                    first_name: entity.firstName,
                    last_name: entity.lastName,
                    username: entity.username,
                    phone: entity.phone
                }
                name = await this.db.user(user_id as any, data as user) ?? name
                this.test_dump(entity, `entity-${sender_id}`)
                // console.log("entity",entity); // Может содержать username, first_name, last_name
            } catch {
                if (message.sender != undefined) {
                    console.log("Try get from Sender", message.sender);
                    const result = await this.client.invoke(
                        new Api.users.GetFullUser({
                            id: message.sender,
                        })
                    );
                    console.log("GetFullUser From Sender", result);
                } else {
                    try {
                        let result = await this.getChannelMessage(channel_peer, message.id as any)
                        let user = result.users[0] as Api.User
                        let data = {
                            id: sender_id as any,
                            first_name: user.firstName,
                            last_name: user.lastName,
                            username: user.username,
                            phone: user.phone
                        }
                        name = await this.db.user(user_id as any, data as user) ?? name
                    } catch {
                        try {
                            const photos = await this.client.invoke(
                                new Api.photos.GetUserPhotos({
                                    userId: sender_id,
                                    offset: 0,
                                    maxId: 0 as any,
                                    limit: 1,
                                })
                            );
                            this.test_dump(photos, `user-photos-${sender_id}`)
                            console.log("PHOTOS", photos); // In Tests
                        } catch { console.warn(`User Get err: ${user_id}`); }
                    }
                }
            }
        }
        return name
    }

    async setPost(message: Api.Message) {
        await this.db.ChannelMessage(message.chatId as any, message.id as any, {
            chat_id: message.chatId as any,
            message_id: message.id as any,
            text: message.message,
            views: message.views,
            media: message.media?.toJSON()
        } as model_post)
        const info = await this.getChannel(message.peerId as Api.PeerChannel)
        if (info.autoread) {
            this.markChanelRead(message.peerId as Api.PeerChannel, message.id as any)
        }
    }

    async getChannelMessage(channel_peer: Api.PeerChannel, message_id: Api.TypeInputMessage): Promise<Api.messages.ChannelMessages> {
        // let t: Api.InputMessageID
        const result: any = await this.client.invoke(
            new Api.channels.GetMessages({
                channel: channel_peer,
                id: [message_id],
            })
        );
        this.test_dump(result, `channel-message-${channel_peer.channelId}`)
        return result
    }

    async getChannel(channel: Api.PeerChannel) {
        let info: model_channel = await this.db.channel(`-100${channel.channelId}` as any) as any
        // console.warn(`full-channel-${channel.channelId}`,info)
        if (info == null) {
            info = DataDefaults.model_channel
            const result = await this.client.invoke(
                new Api.channels.GetFullChannel({
                    channel: channel,
                })
            ) as Api.messages.ChatFull;
            this.test_dump(result, `full-channel-${channel.channelId}`)
            info.chat_id = `-100${result.fullChat.id}` as any
            info.description = result.fullChat.about
            for (const item of result.chats as any) {
                if (parseInt(item.id as string) == parseInt(result.fullChat.id as any)) {
                    info.title = item.title
                }
            }
            // console.log(info);
            info = await this.db.channel(`-100${channel.channelId}` as any, info) as any
        }
        // console.log(result); // prints the result
        return info
    }
    async getChat(channel: Api.PeerChannel) {
        let info: model_chat = await this.db.chat(`-100${channel.channelId}` as any) as any
        // console.warn(`full-channel-${channel.channelId}`,info)
        if (info == null) {
            info = DataDefaults.model_chat
            const result = await this.client.invoke(
                new Api.channels.GetFullChannel({
                    channel: channel,
                })
            ) as Api.messages.ChatFull;
            this.test_dump(result, `full-channel-${channel.channelId}`)
            info.chat_id = `-100${result.fullChat.id}` as any
            info.description = result.fullChat.about
            for (const item of result.chats as any) {
                if (parseInt(item.id as string) == parseInt(result.fullChat.id as any)) {
                    info.title = item.title
                }
            }
            // console.log(info);
            info = await this.db.chat(`-100${channel.channelId}` as any, info) as any
        }
        // console.log(result); // prints the result
        return info
    }

    async UpdateUserStatus(event: any) {
        const user_id: bigint = event.userId.toJSNumber()
        let result = await this.db.user_status(user_id, event.status.className == "UserStatusOnline", event.status.expires ?? Math.round(Date.now() / 1000))
        let name: string = user_id.toString()
        const is_online = event.status.className == "UserStatusOnline" ? "✅ Online" : "🔴 Offline"
        try {
            const user = await this.db.user(user_id)
            if (user != null) name = this.printUserName(user)
        } catch { }
        logger.info(` ${name} >>> ${is_online}`)
    }

    async markChanelRead(channel: Api.PeerChannel, message_id: number) {
        // const entity = await this.client.getEntity(`-100${channel.channelId}`);
        // const inputPeer = await this.client.getInputEntity(entity);

        const input_channel = await this.client.getEntity(`-100${channel.channelId}`);
        // console.log("Channel info:",input_channel);
        try {
            // const result = await this.client.invoke(
            //     new Api.messages.ReadHistory({
            //         peer: input_channel,
            // }));

            // Если это канал
            if (input_channel.className === 'Channel') {
                const result = await this.client.invoke(
                    new Api.channels.ReadHistory({
                        channel: new Api.InputChannel({
                            channelId: input_channel.id, // Преобразуем в BigInt
                            accessHash: input_channel.accessHash as any
                        }),
                        maxId: 0
                    })
                );
                // console.log("Success:", result);
                // this.test_dump(result,`ReadHistoryChannel-${channel.channelId}`)
            }
            else if (input_channel.className === 'Chat') {
                const result = await this.client.invoke(
                    new Api.messages.ReadHistory({
                        peer: new Api.InputPeerChat({
                            chatId: input_channel.id
                        }),
                        maxId: 0
                    })
                );
                // console.log("Success:", result);
                // this.test_dump(result,`ReadHistoryChat-${channel.channelId}`)
            }
            // console.log("Result:", result);
        } catch (error) {
            console.error("Detailed error:", error);
        }
    }
    ingnor_id: any[] = []

    printUserName(user: user) {
        let last = user.last_name != null ? " " + user.last_name : ""
        return user.first_name + last
    }

    async getFullUser(user_id: bigint): Promise<any> {
        const result: Api.users.UserFull = await this.client.invoke(
            new Api.users.GetFullUser({ id: user_id.toString(), })
        );
        let user: Api.User = result.users[0] as Api.User
        const data: user = {
            id: user_id,
            first_name: user.firstName ?? '',
            last_name: user.lastName ?? null,
            username: user.username ?? null,
            phone: user.phone ?? null,
            createdAt: undefined,
            updatedAt: undefined
        }
        return await this.db.user(user_id, data)
    }

    chanels_data: { [id: string]: any; } = {}
    async getChannelParticipants(channel: Api.PeerChannel, offset = 0): Promise<Api.channels.ChannelParticipants> {
        return {} as Api.channels.ChannelParticipants // todo Create check if need update
        if (Object.keys(this.chanels_data).indexOf(channel.channelId.toString()) >= 0 && offset == 0) return this.chanels_data[channel.channelId.toString()]
        else {
            const participants: Api.channels.ChannelParticipants = await this.client.invoke(
                new Api.channels.GetParticipants({ channel, filter: new Api.ChannelParticipantsRecent(), offset, limit: 200 })
            ) as Api.channels.ChannelParticipants;
            logger.info(`get_participants for ${channel.channelId}`)
            // console.log(participants);
            this.chanels_data[channel.channelId.toString()] = participants
            this.test_dump(participants, `channel/${channel.channelId}.participants`)
            for (const user of participants.users) {
                let info = user as Api.User
                if (info.id as any > 0) {
                    let data: user = {
                        id: info.id as any,
                        first_name: info.firstName ?? "",
                        last_name: info.lastName ?? null,
                        phone: info.phone ?? null,
                        username: info.username ?? null,
                        createdAt: undefined,
                        updatedAt: undefined
                    }
                    await this.db.user(info.id as any, data)
                }
            }
            if (offset + 200 < participants.count)
                return await this.getChannelParticipants(channel, offset + 200)
            // let ch = await this.getChannel(channel)
            // this.test_dump(ch, `channel.${channel.channelId}`)
            return participants
        }
    }

    async getChannelParticipant(chanel: Api.PeerChannel, participant: number) {
        const result = await this.client.invoke(
            new Api.channels.GetParticipant({
                channel: chanel.channelId,
                participant: participant,
            })
        );
        console.log(result);
        this.test_dump(result, `channel-participant-${result}`)
    }

    async getUser(user_id: any): Promise<any> {
        const results: Api.help.UserInfo = await this.client.invoke(
            new Api.help.GetUserInfo({
                userId: user_id,
            })
        ) as Api.help.UserInfo;
        console.log(results);
        const entity = await this.client.getEntity(user_id as any)

        const result: Api.TypeUser[] = await this.client.invoke(
            new Api.users.GetUsers({ id: [entity], })
        );

        let user: Api.User = result[0] as Api.User
        const data: user = {
            id: user_id,
            first_name: user.firstName ?? '',
            last_name: user.lastName ?? null,
            username: user.username ?? null,
            phone: user.phone ?? null,
            createdAt: undefined,
            updatedAt: undefined
        }
        return await this.db.user(user_id, data)
    }

    getUserIdFromEvent(event: any) {
        try {
            return event.message.fromId.userId.toJSNumber()
        } catch { return 0 }
    }
}

module.exports = Telegram