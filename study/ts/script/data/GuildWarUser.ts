import { BaseData } from './BaseData';
import { UserDataHelper } from '../utils/data/UserDataHelper';
import { G_ServerTime, G_UserData } from '../init';
let schema = {};
schema['city_id'] = [
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
schema['guild_id'] = [
    'number',
    0
];
schema['guild_name'] = [
    'string',
    ''
];
schema['old_point'] = [
    'number',
    0
];
schema['now_point'] = [
    'number',
    0
];
schema['move_time'] = [
    'number',
    0
];
schema['challenge_time'] = [
    'number',
    0
];
schema['challenge_cd'] = [
    'number',
    0
];
schema['officer_level'] = [
    'number',
    0
];
schema['power'] = [
    'number',
    0
];
schema['base_id'] = [
    'number',
    0
];
schema['avatar_base_id'] = [
    'number',
    0
];
schema['war_value'] = [
    'number',
    0
];
schema['guild_icon'] = [
    'number',
    0
];
schema['pk_type'] = [
    'number',
    0
];
schema['born_point_id'] = [
    'number',
    0
];
schema['relive_time'] = [
    'number',
    0
];
export interface GuildWarUser {
    getCity_id(): number
    setCity_id(value: number): void
    getLastCity_id(): number
    getUser_id(): number
    setUser_id(value: number): void
    getLastUser_id(): number
    getUser_name(): string
    setUser_name(value: string): void
    getLastUser_name(): string
    getGuild_id(): number
    setGuild_id(value: number): void
    getLastGuild_id(): number
    getGuild_name(): string
    setGuild_name(value: string): void
    getLastGuild_name(): string
    getOld_point(): number
    setOld_point(value: number): void
    getLastOld_point(): number
    getNow_point(): number
    setNow_point(value: number): void
    getLastNow_point(): number
    getMove_time(): number
    setMove_time(value: number): void
    getLastMove_time(): number
    getChallenge_time(): number
    setChallenge_time(value: number): void
    getLastChallenge_time(): number
    getChallenge_cd(): number
    setChallenge_cd(value: number): void
    getLastChallenge_cd(): number
    getOfficer_level(): number
    setOfficer_level(value: number): void
    getLastOfficer_level(): number
    getPower(): number
    setPower(value: number): void
    getLastPower(): number
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getAvatar_base_id(): number
    setAvatar_base_id(value: number): void
    getLastAvatar_base_id(): number
    getWar_value(): number
    setWar_value(value: number): void
    getLastWar_value(): number
    getGuild_icon(): number
    setGuild_icon(value: number): void
    getLastGuild_icon(): number
    getPk_type(): number
    setPk_type(value: number): void
    getLastPk_type(): number
    getBorn_point_id(): number
    setBorn_point_id(value: number): void
    getLastBorn_point_id(): number
    getRelive_time(): number
    setRelive_time(value: number): void
    getLastRelive_time(): number
}
export class GuildWarUser extends BaseData {
    public static schema = schema;

    public _playerInfo;

    constructor(user?) {
        super();
        this._playerInfo = {};
        if (user) {
            this.updateUser(user);
        }
    }
    public clear() {
    }
    public reset() {
    }
    public initData(data) {
        this.setProperties(data);
        let [covertId, playerInfo] = UserDataHelper.convertAvatarId(data);
        this._playerInfo = playerInfo;
    }
    public getCurrPoint() {
        let oldPoint = this.getOld_point();
        let nowPoint = this.getNow_point();
        if (oldPoint == 0 || oldPoint == nowPoint) {
            return nowPoint;
        }
        let moveTime = this.getMove_time();
        let time = G_ServerTime.getTime();
        if (time >= moveTime) {
            return nowPoint;
        }
        return 0;
    }
    public getStartPoint() {
        let currPoint = this.getCurrPoint();
        if (currPoint == 0) {
            return this.getOld_point();
        }
        return currPoint;
    }
    public getPlayerInfo() {
        return this._playerInfo;
    }
    public isSelf() {
        let userId = G_UserData.getBase().getId();
        return userId == this.getUser_id();
    }
    public isInBorn() {
        let time = G_ServerTime.getTime();
        console.warn('-----------  ' + time);
        if (time > this.getRelive_time()) {
            return false;
        }
        return true;
    }
    public updateData(msg) {
        this.setCity_id(msg.city_id);
        this.setUser_id(msg.user_id);
        this.setUser_name(msg.user_name);
        this.setGuild_id(msg.guild_id);
        this.setGuild_name(msg.guild_name);
        this.setOld_point(msg.old_point);
        this.setNow_point(msg.now_point);
        this.setMove_time(msg.move_time);
        this.setChallenge_time(msg.challenge_time);
        this.setChallenge_cd(msg.challenge_cd);
        this.setOfficer_level(msg.officer_level);
        this.setPower(msg.power);
        this.setAvatar_base_id(msg.avatar_base_id);
        this.setWar_value(msg.war_value);
        this.setBase_id(msg.base_id);
        this.setGuild_icon(msg.guild_icon);
        this.setPk_type(msg.pk_type);
        this.setBorn_point_id(msg.born_point_id);
        this.setRelive_time(msg.relive_time);
        let [covertId, playerInfo] = UserDataHelper.convertAvatarId(msg);
        this._playerInfo = playerInfo;
    }
    public updateUser(warUser) {
        this.setCity_id(warUser.city_id_);
        this.setUser_id(warUser.user_id_);
        this.setUser_name(warUser.user_name_);
        this.setGuild_id(warUser.guild_id_);
        this.setGuild_name(warUser.guild_name_);
        this.setOld_point(warUser.old_point_);
        this.setNow_point(warUser.now_point_);
        this.setMove_time(warUser.move_time_);
        this.setChallenge_time(warUser.challenge_time_);
        this.setChallenge_cd(warUser.challenge_cd_);
        this.setOfficer_level(warUser.officer_level_);
        this.setPower(warUser.power_);
        this.setAvatar_base_id(warUser.avatar_base_id_);
        this.setWar_value(warUser.war_value_);
        this.setBase_id(warUser.base_id_);
        this.setGuild_icon(warUser.guild_icon_);
        this.setPk_type(warUser.pk_type_);
        this.setBorn_point_id(warUser.born_point_id_);
        this.setRelive_time(warUser.relive_time_);
        this._playerInfo.baseId = warUser._playerInfo.baseId;
        this._playerInfo.avatarBaseId = warUser._playerInfo.avatarBaseId;
        this._playerInfo.covertId = warUser._playerInfo.covertId;
    }
}
