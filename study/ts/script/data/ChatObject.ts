import { BaseData } from './BaseData';
let schema = {};
schema['channel'] = [
    'number',
    0
];

schema['chatPlayerData'] = [
    'object',
    null
];

export interface ChatObject {
    getChannel(): number
    setChannel(value: number): void
    getLastChannel(): number
    getChatPlayerData(): Object
    setChatPlayerData(value: Object): void
    getLastChatPlayerData(): Object
}
export class ChatObject extends BaseData {
    public static schema = schema;
}