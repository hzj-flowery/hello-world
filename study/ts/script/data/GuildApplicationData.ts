import { BaseData } from "./BaseData";
import { UserDataHelper } from "../utils/data/UserDataHelper";

export interface GuildApplicationData {
    getUid(): number
    setUid(value: number): void
    getLastUid(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getPower(): number
    setPower(value: number): void
    getLastPower(): number
    getOffline(): number
    setOffline(value: number): void
    getLastOffline(): number
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getRank_lv(): number
    setRank_lv(value: number): void
    getLastRank_lv(): number
    getLevel(): number
    setLevel(value: number): void
    getLastLevel(): number
    getOfficer_level(): number
    setOfficer_level(value: number): void
    getLastOfficer_level(): number
    getAvatar(): number
    setAvatar(value: number): void
    getLastAvatar(): number
    getPlayer_info(): Object
    setPlayer_info(value: Object): void
    getLastPlayer_info(): Object
    getHead_frame_id(): number
    setHead_frame_id(value: number): void
    getLastHead_frame_id(): number
}
let schema = {};
schema['uid'] = [
    'number',
    0
];
schema['name'] = [
    'string',
    ''
];
schema['power'] = [
    'number',
    0
];
schema['offline'] = [
    'number',
    0
];
schema['base_id'] = [
    'number',
    0
];
schema['rank_lv'] = [
    'number',
    0
];
schema['level'] = [
    'number',
    0
];
schema['officer_level'] = [
    'number',
    0
];
schema['avatar'] = [
    'number',
    0
];
schema['player_info'] = [
    'object',
    null
];
schema['head_frame_id'] = [
    'number',
    0
];
export class GuildApplicationData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
        let [ covertId, playerInfo ] = UserDataHelper.convertAvatarId(properties);
        this.setPlayer_info(playerInfo);
    }
    public clear() {
    }
    public reset() {
    }
}
