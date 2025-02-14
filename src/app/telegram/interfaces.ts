import { JsonValue } from "@prisma/client/runtime/library"


interface user_state {
    id: bigint | undefined
    state: boolean
    last_time: bigint | undefined

    createdAt: Date | undefined | null
    updatedAt: Date | undefined | null
}

interface user {
    id: bigint | undefined
    first_name: string
    last_name: string | null | undefined
    username: string | null | undefined
    phone: string | null | undefined

    createdAt: Date | undefined | null
    updatedAt: Date | undefined | null
}

interface model_channel {
    chat_id: bigint | undefined
    title: string
    description: string | null | undefined
    autoread: boolean | null | undefined

    createdAt: Date | undefined | null
    updatedAt: Date | undefined | null
}

interface model_chat {
    chat_id: bigint | undefined
    title: string
    description: string | null | undefined
    autoread: boolean | null | undefined
    hide_in_console: boolean | null | undefined

    createdAt: Date | undefined | null
    updatedAt: Date | undefined | null
}


interface model_message {
    id: bigint | undefined
    chat_id: bigint | undefined
    message_id: bigint | undefined
    from_id: bigint | undefined | null
    to_id: bigint | undefined | null
    text: string
    is_deleted: boolean | null | undefined

    // from_user User  @relation(name: "sender", fields: [from_id], references: [id])
    // to_user   User? @relation(name: "receiver", fields: [to_id], references: [id])
    // chat      Chat  @relation(fields: [chat_id], references: [chat_id])

    // Временные метки
    createdAt: Date | undefined | null
    updatedAt: Date | undefined | null
}

interface model_post {
    id: bigint | undefined
    chat_id: bigint | undefined
    message_id: bigint | undefined
    is_deleted: boolean | null | undefined
    text: string | undefined
    views: number | undefined
    media: JsonValue | undefined
    // from_user User  @relation(name: "sender", fields: [from_id], references: [id])
    // to_user   User? @relation(name: "receiver", fields: [to_id], references: [id])
    // chat      Chat  @relation(fields: [chat_id], references: [chat_id])

    // Временные метки
    createdAt: Date | undefined | null
    updatedAt: Date | undefined | null
}

const DataDefaults = {
    user: { id: undefined, first_name: "", last_name: null, username: null, phone: null } as user,
    user_state: { id: undefined, state: false, last_time: undefined } as user_state,
    model_post: { id: undefined  } as model_post,
    model_message: { id: undefined  } as model_message,
    model_channel: { chat_id: undefined  } as model_channel,
    model_chat: { chat_id: undefined  } as model_chat,
}

export { DataDefaults, user_state, user, model_message, model_post, model_channel, model_chat }