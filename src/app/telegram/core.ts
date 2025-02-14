import { Api, TelegramClient } from "telegram";
import { App } from "..";
import { StoreSession } from "telegram/sessions";
import { logger } from "../logger";
import { toSerializable } from "../tool";
import fs from "fs";
import path from "path";

import readline from "readline";
import TelegramDb from "./db";
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

export default class TelegramCore {
    app: App
    client_name: string
    client: TelegramClient
    session: StoreSession


    constructor(app: App, name: string, api_id: number, api_hash: string, phone: string, passowrd: string) {
        this.app = app
        this.client_name = name
        this.session = new StoreSession('../data/sessions/'); // path.join(__dirname, '..', config.data_dir, "sessions")
        this.client = new TelegramClient(this.session, api_id, api_hash, { connectionRetries: 5, });
        this.connect(phone, passowrd)
    }

    async connect(phone: string, password: string) {
        await this.client.start({
            phoneNumber: async () => phone,
            password: async () => password,
            phoneCode: async () => new Promise((resolve) =>
                rl.question(`Please enter the code you received for ${this.client_name}: `, resolve)
            ),
            // await input.text(`Please enter the code you received for ${this.client_name}: `),
            onError: (err) => { logger.error(err) },
        });
        let me = await this.client.getEntity("me")
        console.log(me.id);
        this.client.session.save()
        this.client.addEventHandler(event => this.telegram_event(event))
        // this.get_all_chats()
        await this.get_dialogs()
    }

    async stop() {
        this.client.session.save()
        // this.client.
    }

    async get_dialogs() {
        // console.log("TEST");
        const resultd: Api.messages.Dialogs = await this.client.invoke(
            new Api.messages.GetDialogs({
                offsetDate: 0,  // начальная дата
                offsetId: 0,    // начальный ID сообщения
                offsetPeer: new Api.InputPeerEmpty(), // важно! нужно указать корректный InputPeer
                limit: 200,
                //   offsetDate: 43,
                //   offsetId: 43,
                //   offsetPeer: "username",
                //   limit: 100,
                //   hash: BigInt("-4156887774564"),
                //   excludePinned: true,
                //   folderId: 43,
            })
        ) as Api.messages.Dialogs;
        // console.log(resultd); // prints the result
        const result = await this.client.invoke(
            new Api.contacts.GetContacts({ //new Api.messages.GetDialogs({
                // offsetDate: 43,
                // offsetId: 43,
                // offsetPeer: "username",
                // limit: 100,
                // hash: BigInt("-4156887774564"),
                // excludePinned: true,
                // folderId: 43,
            })
        );
        // console.log(result); // prints the result
    }

    telegram_event(event: any) { this.test_dump_event(event) }

    test_dump_event(event: any) {
        const constructor_name = event.constructor.name
        const event_class_name = event.className
        this.test_dump(event, `${event_class_name}`)
    }

    test_dump(data: any, name: string) {
        let to_json = toSerializable(data)
        fs.writeFileSync(path.join(__dirname, '..', '..', '..', "data", "test", `dump.${name}.json`), JSON.stringify(to_json, null, 4),)
    }
}

