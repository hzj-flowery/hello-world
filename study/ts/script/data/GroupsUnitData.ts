import { BaseData } from "./BaseData";
import { ArraySort } from "../utils/handler";
import { GroupsMemberData } from "./GroupsMemberData";
import { GroupsDataHelper } from "../utils/data/GroupsDataHelper";

export interface GroupsUnitData {
}
let schema = {};
export class GroupsUnitData extends BaseData {
    public static schema = schema;

        _memberList;
    constructor(properties?) {
        super(properties);
        this._memberList = {};
    }
    public clear() {
        this._memberList = {};
    }
    public reset() {
        this._memberList = {};
    }
    public getMemberData(teamId) {
        return this._memberList[teamId];
    }
    public getDataList() {
        let sortFunc = function (a, b) {
            if (a.isIs_scene() != b.isIs_scene()) {
                return a.isIs_scene() == false;
            } else if (a.getTeam_id() != b.getTeam_id()) {
                return a.getTeam_id() < b.getTeam_id();
            } else {
                return a.getUserCount() > b.getUserCount();
            }
        };
        let dataList = [];
        for (let k in this._memberList) {
            let data = this._memberList[k];
            if (!data.isFull()) {
                dataList.push(data);
            }
        }
        ArraySort(dataList, sortFunc);
        return dataList;
    }
    public updateData(teams) {
        for (let i in teams) {
            let team = teams[i];
            let teamId = team['team_id'] || 0;
            let memberData = this.getMemberData(teamId);
            if (memberData == null) {
                memberData = new GroupsMemberData();
            }
            memberData.updateData(team);
            this._memberList[teamId] = memberData;
        }
    }
    public removeGroupData(delId) {
        delete this._memberList[delId];
    }
    public updateApplicationTime(appTeams) {
        for (let i in appTeams) {
            let appTeam = appTeams[i];
            let teamId = appTeam.team_id;
            let appTime = appTeam.app_time;
            let memberData = this.getMemberData(teamId);
            if (memberData) {
                let teamType = memberData.getTeam_type();
                let refuseJoinTime = GroupsDataHelper.getTeamInfoConfig(teamType).refuse_join_time;
                memberData.setApplyEndTime(appTime + refuseJoinTime);
            }
        }
    }
}
