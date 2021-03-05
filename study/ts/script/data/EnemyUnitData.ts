import { BaseData } from "./BaseData";
import { UserDataHelper } from "../utils/data/UserDataHelper";

export interface EnemyUnitData {
    getUid(): number
    setUid(value: number): void
    getLastUid(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getLevel(): number
    setLevel(value: number): void
    getLastLevel(): number
    getVip(): number
    setVip(value: number): void
    getLastVip(): number
    getOnline(): number
    setOnline(value: number): void
    getLastOnline(): number
    getPower(): number
    setPower(value: number): void
    getLastPower(): number
    getGuild_name(): string
    setGuild_name(value: string): void
    getLastGuild_name(): string
    getGuild_id(): number
    setGuild_id(value: number): void
    getLastGuild_id(): number
    getOffice_level(): number
    setOffice_level(value: number): void
    getLastOffice_level(): number
    getEnemy_value(): number
    setEnemy_value(value: number): void
    getLastEnemy_value(): number
    getMine_name(): string
    setMine_name(value: string): void
    getLastMine_name(): string
    getCovertId(): number
    setCovertId(value: number): void
    getLastCovertId(): number
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
schema['level'] = [
    'number',
    0
];
schema['vip'] = [
    'number',
    0
];
schema['online'] = [
    'number',
    0
];
schema['power'] = [
    'number',
    0
];
schema['guild_name'] = [
    'string',
    ''
];
schema['guild_id'] = [
    'number',
    0
];
schema['office_level'] = [
    'number',
    0
];
schema['enemy_value'] = [
    'number',
    0
];
schema['mine_name'] = [
    'string',
    ''
];
schema['covertId'] = [
    'number',
    0
];
schema['head_frame_id'] = [
    'number',
    0
];
export class EnemyUnitData extends BaseData {
    public static schema = schema;

    public clear() {
    }
    public reset() {
    }
    public updateData(messageData) {
        this.setProperties(messageData);
        let covertId = UserDataHelper.convertAvatarId(messageData)[0];
        if (covertId) {
            this.setCovertId(covertId);
        }
    }
}
