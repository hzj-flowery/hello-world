import { BaseData } from "./BaseData";
import { G_UserData } from "../init";

export interface GuildServerAnswerPlayerUnitData {
    getUser_id(): number
    setUser_id(value: number): void
    getLastUser_id(): number
    getGuild_id(): number
    setGuild_id(value: number): void
    getLastGuild_id(): number
    getGuild_name(): string
    setGuild_name(value: string): void
    getLastGuild_name(): string
    getName(): string
    setName(value: string): void
    getLastName(): string
    getLevel(): number
    setLevel(value: number): void
    getLastLevel(): number
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getAvatar_base_id(): number
    setAvatar_base_id(value: number): void
    getLastAvatar_base_id(): number
    getSide(): number
    setSide(value: number): void
    getLastSide(): number
    getSort(): number
    setSort(value: number): void
    getLastSort(): number
    setSecurity_times(value:number):void
    getSecurity_times():number
}
let schema = {};
schema['user_id'] = [
    'number',
    0
];
schema['guild_id'] = [
    'number',
    0
];
schema['guild_name'] = [
    'string',
    ''
];
schema['name'] = [
    'string',
    ''
];
schema['level'] = [
    'number',
    0
];
schema['base_id'] = [
    'number',
    {}
];
schema['avatar_base_id'] = [
    'number',
    0
];
schema['side'] = [
    'number',
    0
];
schema['sort'] = [
    'number',
    0
];
schema['security_times'] = [
    'number',
    0
];
export class GuildServerAnswerPlayerUnitData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public updateData(properties) {
        this.setProperties(properties);
        let myUser_id = G_UserData.getBase().getId();
        if (this.getUser_id() == myUser_id) {
            this.setSort(2);
        } else {
            this.setSort(1);
        }
    }
    public isSelf() {
        let myUser_id = G_UserData.getBase().getId();
        return myUser_id == this.getUser_id();
    }
}
