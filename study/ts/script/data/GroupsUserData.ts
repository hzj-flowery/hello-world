import { BaseData } from "./BaseData";
import { G_ServerTime, G_UserData, G_SignalManager } from "../init";
import { AvatarDataHelper } from "../utils/data/AvatarDataHelper";
import { HeroConst } from "../const/HeroConst";
import { SignalConst } from "../const/SignalConst";
import { UserDataHelper } from "../utils/data/UserDataHelper";

export interface GroupsUserData {
    getUser_id(): number
    setUser_id(value: number): void
    getLastUser_id(): number
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getAvatar_base_id(): number
    setAvatar_base_id(value: number): void
    getLastAvatar_base_id(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getOffice_level(): number
    setOffice_level(value: number): void
    getLastOffice_level(): number
    getLevel(): number
    setLevel(value: number): void
    getLastLevel(): number
    getPower(): number
    setPower(value: number): void
    getLastPower(): number
    getGuild_name(): string
    setGuild_name(value: string): void
    getLastGuild_name(): string
    getTitle(): number
    setTitle(value: number): void
    getLastTitle(): number
    getHead_frame_id(): number
    setHead_frame_id(value: number): void
    getLastHead_frame_id(): number
    getCovertId(): number
    setCovertId(value: number): void
    getLastCovertId(): number
    getLimitLevel(): number
    setLimitLevel(value: number): void
    getLastLimitLevel(): number
    getApplyEndTime(): number
    setApplyEndTime(value: number): void
    getLastApplyEndTime(): number
    getInviteEndTime(): number
    setInviteEndTime(value: number): void
    getLastInviteEndTime(): number
    isConfirmEnterScene(): boolean
    setConfirmEnterScene(value: boolean): void
    isLastConfirmEnterScene(): boolean
}
let schema = {};
schema['user_id'] = [
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
schema['name'] = [
    'string',
    ''
];
schema['office_level'] = [
    'number',
    0
];
schema['level'] = [
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
schema['title'] = [
    'number',
    0
];
schema['head_frame_id'] = [
    'number',
    0
];
schema['covertId'] = [
    'number',
    0
];
schema['limitLevel'] = [
    'number',
    0
];
schema['applyEndTime'] = [
    'number',
    0
];
schema['inviteEndTime'] = [
    'number',
    0
];
schema['confirmEnterScene'] = [
    'boolean',
    false
];
export class GroupsUserData extends BaseData {

    public static schema = schema;
    constructor(properties?) {
        super(properties);
        cc.director.getScheduler().enableForTarget(this);
    }
    public clear() {
        this._endCountDown();
    }
    public reset() {
    }
    public isEndApply() {
        let endTime = this.getApplyEndTime();
        let time = G_ServerTime.getLeftSeconds(endTime);
        return time <= 0;
    }
    public isEndInvite() {
        let endTime = this.getInviteEndTime();
        let time = G_ServerTime.getLeftSeconds(endTime);
        return time <= 0;
    }
    public updateData(data) {
        this.setProperties(data);
        let [covertId, table] = UserDataHelper.convertAvatarId(data);
        if (covertId && table) {
            this.setCovertId(covertId);
            let avatarBaseId = table.avatarBaseId;
            if (avatarBaseId > 0) {
                let limit = AvatarDataHelper.getAvatarConfig(avatarBaseId).limit;
                if (limit == 1) {
                    this.setLimitLevel(HeroConst.HERO_LIMIT_MAX_LEVEL);
                }
            }
        }
    }
    public isSelf() {
        let selfId = G_UserData.getBase().getId();
        let userId = this.getUser_id();
        return selfId == userId;
    }
    public isLeader() {
        let myMemberData = G_UserData.getGroups().getMyGroupData();
        if (myMemberData) {
            let memberData = myMemberData.getGroupData();
            let leaderId = memberData.getTeam_leader();
            let userId = this.getUser_id();
            return leaderId == userId;
        }
        return false;
    }
    public startCountDown() {
        this._endCountDown();
        let nowTime = G_ServerTime.getTime();
        let endTime = this.getApplyEndTime();
        let interval = endTime - nowTime;
        if (interval > 0) {
            cc.director.getScheduler().schedule(this._onEndApply, this, interval);
        }
    }
    public _endCountDown() {
        cc.director.getScheduler().unschedule(this._onEndApply, this);
    }
    public _onEndApply() {
        this._endCountDown();
        let userId = this.getUser_id();
        let myMemberData = G_UserData.getGroups().getMyGroupData();
        if (myMemberData) {
            myMemberData.removeApplyDataWithId(userId);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_APPLY_TIME_OUT, userId);
    }
    public isInGuild() {
        let name = this.getGuild_name();
        return name != '';
    }
}
