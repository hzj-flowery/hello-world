import { BaseData } from "./BaseData";

export interface GuildOpenRedBagUserData {
    getUser_id(): number
    setUser_id(value: number): void
    getLastUser_id(): number
    getUser_name(): string
    setUser_name(value: string): void
    getLastUser_name(): string
    getGet_money(): number
    setGet_money(value: number): void
    getLastGet_money(): number
    isIs_best(): boolean
    setIs_best(value: boolean): void
    isLastIs_best(): boolean
}
let schema = {};
schema['user_id'] = [
    'number',
    0
];
schema['user_name'] = [
    'string',
    ''
];
schema['get_money'] = [
    'number',
    0
];
schema['is_best'] = [
    'boolean',
    false
];
export class GuildOpenRedBagUserData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
}
