import { BaseData } from "./BaseData";
import { G_ServerTime, G_SignalManager, G_UserData } from "../init";
import { GroupsConst } from "../const/GroupsConst";
import { SignalConst } from "../const/SignalConst";
import { GroupsUserData } from "./GroupsUserData";

export interface GroupsMemberData {
    getTeam_id(): number
    setTeam_id(value: number): void
    getLastTeam_id(): number
    getTeam_type(): number
    setTeam_type(value: number): void
    getLastTeam_type(): number
    getTeam_target(): number
    setTeam_target(value: number): void
    getLastTeam_target(): number
    getMin_level(): number
    setMin_level(value: number): void
    getLastMin_level(): number
    getMax_level(): number
    setMax_level(value: number): void
    getLastMax_level(): number
    getTeam_leader(): number
    setTeam_leader(value: number): void
    getLastTeam_leader(): number
    getMembers(): Object
    setMembers(value: Object): void
    getLastMembers(): Object
    isIs_scene(): boolean
    setIs_scene(value: boolean): void
    isLastIs_scene(): boolean
    getApplyEndTime(): number
    setApplyEndTime(value: number): void
    getLastApplyEndTime(): number
}
let schema = {};
schema['team_id'] = [
    'number',
    0
];
schema['team_type'] = [
    'number',
    0
];
schema['team_target'] = [
    'number',
    0
];
schema['min_level'] = [
    'number',
    0
];
schema['max_level'] = [
    'number',
    0
];
schema['team_leader'] = [
    'number',
    0
];
schema['members'] = [
    'object',
    {}
];
schema['is_scene'] = [
    'boolean',
    false
];
schema['applyEndTime'] = [
    'number',
    0
];
export class GroupsMemberData extends BaseData {
    public static schema = schema;
    _userList;

    constructor(properties?) {
        super(properties);
        this._userList = {};
        cc.director.getScheduler().enableForTarget(this);
    }
    public clear() {
        this._userList = {};
    }
    public reset() {
        this._userList = {};
    }
    public updateData(data) {
        this._userList = {};
        this.setProperties(data);
        let members = data['members'] || {};
        for (let i in members) {
            let member = members[i];
            let user = member['user'];
            let teamNo = member['team_no'] || 0;
            let userData = new GroupsUserData();
            userData.updateData(user);
            this._userList[teamNo] = userData;
        }
    }
    public checkLeaderIsSelf() {
        let selfId = G_UserData.getBase().getId();
        let leaderId = this.getTeam_leader();
        return selfId == leaderId;
    }
    public isSelfGroup() {
        let myGroupData = G_UserData.getGroups().getMyGroupData();
        if (myGroupData) {
            let selfTeamId = myGroupData.getGroupData().getTeam_id();
            let teamId = this.getTeam_id();
            return selfTeamId == teamId;
        }
        return false;
    }
    public getLeaderName() {
        let leaderId = this.getTeam_leader();
        for (let k in this._userList) {
            let data = this._userList[k];
            if (data.getUser_id() == leaderId) {
                return data.getName();
            }
        }
        return '';
    }
    public getUserDataWithLocation(location) {
        return this._userList[location];
    }
    public getUserData(userId) {
        for (let k in this._userList) {
            let data = this._userList[k];
            if (data.getUser_id() == userId) {
                return data;
            }
        }
        return null;
    }
    public isEndApply() {
        let endTime = this.getApplyEndTime();
        let time = G_ServerTime.getLeftSeconds(endTime);
        return time <= 0;
    }
    public getUserList() {
        return this._userList;
    }
    public getUserCount() {
        let count = 0;
        for (let k in this._userList) {
            let data = this._userList[k];
            count = count + 1;
        }
        return count;
    }
    public removeUserById(userId) {
        for (let k in this._userList) {
            let data = this._userList[k];
            if (data.getUser_id() == userId) {
                this._userList[k] = null;
            }
        }
    }
    public isFull() {
        let count = this.getUserCount();
        return count >= GroupsConst.MAX_PLAYER_SIZE;
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
        let teamType = this.getTeam_type();
        let teamId = this.getTeam_id();
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_APPLY_JOIN_TIME_OUT, teamType, teamId);
    }
}
