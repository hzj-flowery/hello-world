import { BaseData } from "./BaseData";
import { GroupsUserData } from "./GroupsUserData";
import { G_ServerTime } from "../init";
import { GroupsDataHelper } from "../utils/data/GroupsDataHelper";

export interface GroupsPreSceneData {
    getTeam_target(): number
    setTeam_target(value: number): void
    getLastTeam_target(): number
    isFirst(): boolean
    setFirst(value: boolean): void
    isLastFirst(): boolean
    getAgreeTime(): number
    setAgreeTime(value: number): void
    getLastAgreeTime(): number
}
let schema = {};
schema['team_target'] = [
    'number',
    0
];
schema['first'] = [
    'boolean',
    false
];
schema['agreeTime'] = [
    'number',
    0
];
export class GroupsPreSceneData extends BaseData {
    public static schema = schema;

    _memberStates;

    constructor(properties?) {
        super(properties);
        this._memberStates = {};
    }
    public clear() {
    }
    public reset() {
        this._memberStates = {};
    }
    public updateData(data) {
        let memberState = data['member_state'] || {};
        let teamTarget = data['team_target'] || 0;
        let first = data['first'] || false;
        this._memberStates = {};
        for (let i in memberState) {
            let info = memberState[i];
            let member = info['member'];
            let state = info['state'];
            let user = member['user'];
            let teamNo = member['team_no'];
            let userData = new GroupsUserData();
            userData.updateData(user);
            userData.setConfirmEnterScene(state);
            this._memberStates[teamNo] = userData;
        }
        this.setTeam_target(teamTarget);
        this.setFirst(first);
        if (first) {
            let agreeTime = G_ServerTime.getTime() + GroupsDataHelper.getTeamTargetConfig(teamTarget).agree_activity_time;
            this.setAgreeTime(agreeTime);
        }
    }
    public getUserDataWithLocation(location) {
        return this._memberStates[location];
    }
    public getMemberCount() {
        let count = 0;
        for (let k in this._memberStates) {
            let data = this._memberStates[k];
            count = count + 1;
        }
        return count;
    }
    public getAgreeCount() {
        let count = 0;
        for (let k in this._memberStates) {
            let data = this._memberStates[k];
            if (data.isConfirmEnterScene()) {
                count = count + 1;
            }
        }
        return count;
    }
}
