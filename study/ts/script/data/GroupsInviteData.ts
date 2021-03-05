import { BaseData } from "./BaseData";
import { G_ServerTime, G_SignalManager, G_UserData } from "../init";
import { SignalConst } from "../const/SignalConst";

export interface GroupsInviteData {
    getUser_id(): number
    setUser_id(value: number): void
    getLastUser_id(): number
    getInvite_time(): number
    setInvite_time(value: number): void
    getLastInvite_time(): number
}
let schema = {};
schema['user_id'] = [
    'number',
    0
];
schema['invite_time'] = [
    'number',
    0
];
export class GroupsInviteData extends BaseData {

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
    public updateData(data) {
        this.setProperties(data);
        this._startCountDown();
    }
    public isEndInvite() {
        let endTime = this.getInvite_time();
        let time = G_ServerTime.getLeftSeconds(endTime);
        return time <= 0;
    }
    public _startCountDown() {
        this._endCountDown();
        let nowTime = G_ServerTime.getTime();
        let endTime = this.getInvite_time();
        let interval = endTime - nowTime;
        if (interval > 0) {
            let scheduler = cc.director.getScheduler();
            scheduler.enableForTarget(this);
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
            myMemberData.removeInviteDataById(userId);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_INVITE_TIME_OUT, userId);
    }
}
