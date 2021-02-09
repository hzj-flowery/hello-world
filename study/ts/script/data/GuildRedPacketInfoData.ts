import { BaseData } from "./BaseData";
import { G_ConfigLoader, G_UserData } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";

export interface GuildRedPacketInfoData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getRed_bag_id(): number
    setRed_bag_id(value: number): void
    getLastRed_bag_id(): number
    getTotal_money(): number
    setTotal_money(value: number): void
    getLastTotal_money(): number
    getMultiple(): number
    setMultiple(value: number): void
    getLastMultiple(): number
    getUser_id(): number
    setUser_id(value: number): void
    getLastUser_id(): number
    getUser_name(): string
    setUser_name(value: string): void
    getLastUser_name(): string
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getAvatar_base_id(): number
    setAvatar_base_id(value: number): void
    getLastAvatar_base_id(): number
    getRed_bag_state(): number
    setRed_bag_state(value: number): void
    getLastRed_bag_state(): number
    getRed_bag_sum(): number
    setRed_bag_sum(value: number): void
    getLastRed_bag_sum(): number
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['red_bag_id'] = [
    'number',
    0
];
schema['total_money'] = [
    'number',
    0
];
schema['multiple'] = [
    'number',
    0
];
schema['user_id'] = [
    'number',
    0
];
schema['user_name'] = [
    'string',
    ''
];
schema['base_id'] = [
    'number',
    0
];
schema['avatar_base_id'] = [
    'number',
    0
];
schema['red_bag_state'] = [
    'number',
    0
];
schema['red_bag_sum'] = [
    'number',
    0
];
export class GuildRedPacketInfoData extends BaseData {

    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public getConfig() {
        let GuildRedpacket = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_REDPACKET);
        let cfg = GuildRedpacket.get(this.getRed_bag_id());
        console.assert(cfg, 'guild_redpacket cannot find id  ' + String(this.getRed_bag_id()));
        return cfg;
    }
    public isSelfRedPacket() {
        return this.getUser_id() == G_UserData.getBase().getId();
    }
}
