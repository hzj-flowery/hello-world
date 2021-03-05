import { BaseData } from "./BaseData";
import { G_ServerTime, G_UserData } from "../init";
import { AvatarDataHelper } from "../utils/data/AvatarDataHelper";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { HeroConst } from "../const/HeroConst";

export interface GuildTrainData {
    getUser_id(): number
    setUser_id(value: number): void
    getLastUser_id(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getOffice_level(): number
    setOffice_level(value: number): void
    getLastOffice_level(): number
    getLeader(): number
    setLeader(value: number): void
    getLastLeader(): number
    getAvatar_base_id(): number
    setAvatar_base_id(value: number): void
    getLastAvatar_base_id(): number
    getTitle(): number
    setTitle(value: number): void
    getLastTitle(): number
    getLevel(): number
    setLevel(value: number): void
    getLastLevel(): number
    getAvarta_base_id(): number
    setAvarta_base_id(value: number): void
    getLastAvarta_base_id(): number
    getLimit_level(): number
    setLimit_level(value: number): void
    getLastLimit_level(): number
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getOfficer_level(): number
    setOfficer_level(value: number): void
    getLastOfficer_level(): number
    getCovertId(): number
    setCovertId(value: number): void
    getLastCovertId(): number
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
schema['name'] = [
    'string',
    {}
];
schema['office_level'] = [
    'number',
    0
];
schema['leader'] = [
    'number',
    0
];
schema['avatar_base_id'] = [
    'number',
    0
];
schema['title'] = [
    'number',
    0
];
schema['level'] = [
    'number',
    0
];
schema['avarta_base_id'] = [
    'number',
    0
];
schema['limit_level'] = [
    'number',
    0
];
schema['base_id'] = [
    'number',
    0
];
schema['officer_level'] = [
    'number',
    0
];
schema['covertId'] = [
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
export class GuildTrainData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
        let [covertId, table] = UserDataHelper.convertAvatarId(properties);
        if (covertId && table) {
            this.setCovertId(covertId);
            let avatarBaseId = table.avatarBaseId;
            if (avatarBaseId > 0) {
                let limit = AvatarDataHelper.getAvatarConfig(avatarBaseId).limit;
                if (limit == 1) {
                    this.setLimit_level(HeroConst.HERO_LIMIT_MAX_LEVEL);
                }
            }
        }
    }
    public isEndInvite() {
        let endTime = this.getInviteEndTime();
        let time = G_ServerTime.getLeftSeconds(endTime);
        return time <= 0;
    }
    public startCountDown() {
        this._endCountDown();
        let nowTime = G_ServerTime.getTime();
        let endTime = this.getInviteEndTime();
        let interval = endTime - nowTime;
        if (interval > 0) {
            let scheduler = cc.director.getScheduler();
            scheduler.enableForTarget(this);
            cc.director.getScheduler().schedule(this._onEndApply, this, interval, 0, 0);
        }
    }
    public _onEndApply() {
        let userId = this.getUser_id();
        G_UserData.getGuild().c2sConfirmGuildTrain(userId, false);
        this._endCountDown();
    }
    public _endCountDown() {
        cc.director.getScheduler().unschedule(this._onEndApply, this);
    }
    public clear() {
        this._endCountDown();
    }
    public reset() {
    }
}
