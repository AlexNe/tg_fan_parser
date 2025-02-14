

import path from "path";
import Telegram from "./telegram";
import { logger } from "./logger";


export class App {
    telegram_clients: { [key:string]: Telegram } = {}
    users = {}

    constructor() {
    }

    start() {
        this.create_telegram_clients()
    }

    stop() {
        Object.values(this.telegram_clients).forEach( (telegram_client: Telegram ) => {
            telegram_client.stop()
        })
    }

    create_telegram_clients() {
        let index = 1;
        while(process.env.hasOwnProperty(`TG_NAME_${index}`)){
            this.create_telegram_client(process.env[`TG_NAME_${index}`] ?? '', process.env[`TG_PHONE_${index}`] ?? '', process.env[`TG_PASSWORD_${index}`] ?? '')
            index++
        }
        // this.create_telegram_client(process.env.TG_NAME_1 ?? '', process.env.TG_PHONE_1 ?? '', process.env.TG_PASSWORD_1 ?? '')
        // this.create_telegram_client(process.env.TG_NAME_2 ?? '', process.env.TG_PHONE_2 ?? '', process.env.TG_PASSWORD_2 ?? '')
        // this.create_telegram_client(process.env.TG_NAME_3 ?? '', process.env.TG_PHONE_3 ?? '', process.env.TG_PASSWORD_3 ?? '')
        // this.create_telegram_client(process.env.TG_NAME_4 ?? '', process.env.TG_PHONE_4 ?? '', process.env.TG_PASSWORD_4 ?? '')

    }
    create_telegram_client(name:string, phone:string, passowrd:string) {
        const api_id = parseInt(process.env.TG_API_ID ?? '')
        const api_hash = process.env.TG_API_HASH ?? ''
        if(name.length > 0 && phone.length > 0 && api_id > 0 && api_hash.length > 0) {
            logger.info(`Create Telegram Client for: ${name}`)
            this.telegram_clients[name] = new Telegram(this, name, api_id, api_hash, phone, passowrd)
        }
    }
}


