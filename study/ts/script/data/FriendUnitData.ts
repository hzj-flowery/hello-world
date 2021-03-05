import { BaseData } from "./BaseData";
import { UserDataHelper } from "../utils/data/UserDataHelper";

export interface FriendUnitData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getLevel(): number
    setLevel(value: number): void
    getLastLevel(): number
    getVip(): number
    setVip(value: number): void
    getLastVip(): number
    getPower(): number
    setPower(value: number): void
    getLastPower(): number
    getOnline(): number
    setOnline(value: number): void
    getLastOnline(): number
    isCanGivePresent(): boolean
    setCanGivePresent(value: boolean): void
    isLastCanGivePresent(): boolean
    isCanGetPresent(): boolean
    setCanGetPresent(value: boolean): void
    isLastCanGetPresent(): boolean
    getGuild_name(): string
    setGuild_name(value: string): void
    getLastGuild_name(): string
    getFriend_count(): number
    setFriend_count(value: number): void
    getLastFriend_count(): number
    getOffice_level(): number
    setOffice_level(value: number): void
    getLastOffice_level(): number
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getCovertId(): number
    setCovertId(value: number): void
    getLastCovertId(): number
    getPlayerShowInfo(): Object
    setPlayerShowInfo(value: Object): void
    getLastPlayerShowInfo(): Object
    getHead_frame_id(): number
    setHead_frame_id(value: number): void
    getLastHead_frame_id(): number
}


let schema = {};
schema['id'] = [
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
schema['power'] = [
    'number',
    0
];
schema['online'] = [
    'number',
    0
];
schema['canGivePresent'] = [
    'boolean',
    false
];
schema['canGetPresent'] = [
    'boolean',
    false
];
schema['guild_name'] = [
    'string',
    ''
];
schema['friend_count'] = [
    'number',
    0
];
schema['office_level'] = [
    'number',
    0
];
schema['base_id'] = [
    'number',
    0
];
schema['covertId'] = [
    'number',
    0
];
schema['playerShowInfo'] = [
    'object',
    null
];
schema['head_frame_id'] = [
    'number',
    0
];
export class FriendUnitData extends BaseData {
    public static schema = schema


    public clear() {
    }
    public reset() {
    }
    public updateData(messageData) {
        this.setId(messageData.id);
        this.setName(messageData.name);
        this.setLevel(messageData.level);
        this.setVip(messageData.vip);
        this.setPower(messageData.power);
        this.setOnline(messageData.online);
        let present = messageData['present'];
        if (present) {
            this.setCanGivePresent(present);
        }
        let getpresent = messageData['getpresent'];
        if (getpresent) {
            this.setCanGetPresent(getpresent);
        }
        let base_id = messageData['base_id'];
        if (base_id) {
            this.setBase_id(base_id);
        }
        let guild_name = messageData['guild_name'];
        if (guild_name) {
            this.setGuild_name(guild_name);
        }
        let friend_count = messageData['friend_count'];
        if (friend_count) {
            this.setFriend_count(friend_count);
        }
        let office_level = messageData['office_level'];
        if (office_level) {
            this.setOffice_level(office_level);
        }
        let [ covertId, playerShowInfo] = UserDataHelper.convertAvatarId(messageData);
        if (covertId) {
            this.setCovertId(covertId);
        }
        this.setPlayerShowInfo(playerShowInfo);
        let head_frame_id = messageData['head_frame_id'];
        if (head_frame_id) {
            this.setHead_frame_id(head_frame_id);
        }
    }
}
