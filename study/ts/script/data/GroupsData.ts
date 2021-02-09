import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_ServerTime, G_Prompt } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { GroupsUnitData } from "./GroupsUnitData";
import PopupGuildMemberInfo from "../scene/view/guild/PopupGuildMemberInfo";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { GroupsMyMemberData } from "./GroupsMyMemberData";
import { GroupsDataHelper } from "../utils/data/GroupsDataHelper";
import { Lang } from "../lang/Lang";
import { GroupsConst } from "../const/GroupsConst";
import { GroupsViewHelper } from "../scene/view/groups/GroupsViewHelper";
import { GroupsUserData } from "./GroupsUserData";

export interface GroupsData {
    isTipInvite(): boolean
    setTipInvite(value: boolean): void
    isLastTipInvite(): boolean
}
let schema = {};
schema['tipInvite'] = [
    'boolean',
    true
];
export class GroupsData extends BaseData {
    public static schema = schema;

    _groupsUnitList;
    _myGroupData;
    _recvGetTeamList;
    _recvUpdateTeamInfo;
    _recvCreateTeam;
    _recvUpdateMyTeam;
    _recvApplyTeam;
    _recvLeaveTeam;
    _recvChangeTeamSet;
    _recvTransferLeader;
    _recvAppTransferLeader;
    _recvAppTransferLeaderNotice;
    _recvOpTransferLeader;
    _recvInviteJoinTeamNotice;
    _recvOpInviteJoinTeam;
    _recvTeamTips;
    _recvTeamEnterScene;
    _recvOpEnterScene;
    _recvSyncApplyTeamList;
    constructor(properties?) {
        super(properties);
        this._groupsUnitList = {};
        this._myGroupData = null;
        this._recvGetTeamList = G_NetworkManager.add(MessageIDConst.ID_S2C_GetTeamList, this._s2cGetTeamList.bind(this));
        this._recvUpdateTeamInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateTeamInfo, this._s2cUpdateTeamInfo.bind(this));
        this._recvCreateTeam = G_NetworkManager.add(MessageIDConst.ID_S2C_CreateTeam, this._s2cCreateTeam.bind(this));
        this._recvUpdateMyTeam = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateMyTeam, this._s2cUpdateMyTeam.bind(this));
        this._recvApplyTeam = G_NetworkManager.add(MessageIDConst.ID_S2C_AppTeam, this._s2cApplyTeam.bind(this));
        this._recvLeaveTeam = G_NetworkManager.add(MessageIDConst.ID_S2C_LeaveTeam, this._s2cLeaveTeam.bind(this));
        this._recvChangeTeamSet = G_NetworkManager.add(MessageIDConst.ID_S2C_ChangeTeamSet, this._s2cChangeTeamSet.bind(this));
        this._recvTransferLeader = G_NetworkManager.add(MessageIDConst.ID_S2C_TransferLeader, this._s2cTransferLeader.bind(this));
        this._recvAppTransferLeader = G_NetworkManager.add(MessageIDConst.ID_S2C_AppTransferLeader, this._s2cAppTransferLeader.bind(this));
        this._recvAppTransferLeaderNotice = G_NetworkManager.add(MessageIDConst.ID_S2C_AppTransferLeaderNotice, this._s2cAppTransferLeaderNotice.bind(this));
        this._recvOpTransferLeader = G_NetworkManager.add(MessageIDConst.ID_S2C_OpTransferLeader, this._s2cOpTransferLeader.bind(this));
        this._recvInviteJoinTeamNotice = G_NetworkManager.add(MessageIDConst.ID_S2C_InviteJoinTeamNotice, this._s2cInviteJoinTeamNotice.bind(this));
        this._recvOpInviteJoinTeam = G_NetworkManager.add(MessageIDConst.ID_S2C_OpInviteJoinTeam, this._s2cOpInviteJoinTeam.bind(this));
        this._recvTeamTips = G_NetworkManager.add(MessageIDConst.ID_S2C_TeamTips, this._s2cTeamTips.bind(this));
        this._recvTeamEnterScene = G_NetworkManager.add(MessageIDConst.ID_S2C_TeamEnterScene, this._s2cTeamEnterScene.bind(this));
        this._recvOpEnterScene = G_NetworkManager.add(MessageIDConst.ID_S2C_OpEnterScene, this._s2cOpEnterScene.bind(this));
        this._recvSyncApplyTeamList = G_NetworkManager.add(MessageIDConst.ID_S2C_SyncAppTeamList, this._s2cSyncApplyTeamList.bind(this));
    }
    public clear() {
        this._recvGetTeamList.remove();
        this._recvGetTeamList = null;
        this._recvUpdateTeamInfo.remove();
        this._recvUpdateTeamInfo = null;
        this._recvCreateTeam.remove();
        this._recvCreateTeam = null;
        this._recvUpdateMyTeam.remove();
        this._recvUpdateMyTeam = null;
        this._recvApplyTeam.remove();
        this._recvApplyTeam = null;
        this._recvLeaveTeam.remove();
        this._recvLeaveTeam = null;
        this._recvChangeTeamSet.remove();
        this._recvChangeTeamSet = null;
        this._recvTransferLeader.remove();
        this._recvTransferLeader = null;
        this._recvAppTransferLeader.remove();
        this._recvAppTransferLeader = null;
        this._recvAppTransferLeaderNotice.remove();
        this._recvAppTransferLeaderNotice = null;
        this._recvOpTransferLeader.remove();
        this._recvOpTransferLeader = null;
        this._recvInviteJoinTeamNotice.remove();
        this._recvInviteJoinTeamNotice = null;
        this._recvOpInviteJoinTeam.remove();
        this._recvOpInviteJoinTeam = null;
        this._recvTeamTips.remove();
        this._recvTeamTips = null;
        this._recvTeamEnterScene.remove();
        this._recvTeamEnterScene = null;
        this._recvOpEnterScene.remove();
        this._recvOpEnterScene = null;
        this._recvSyncApplyTeamList.remove();
        this._recvSyncApplyTeamList = null;
        this.reset();
    }
    public reset() {
        this._groupsUnitList = {};
        this._clearMyGroupData();
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_DATA_CLEAR);
    }
    public getMyGroupData() {
        return this._myGroupData;
    }
    public _clearMyGroupData() {
        if (this._myGroupData) {
            this._myGroupData.clear();
            this._myGroupData = null;
        }
    }
    public getGroupsUnitData(teamType) {
        let unitData = this._groupsUnitList[teamType];
        return unitData;
    }
    public _getMemberDataById(teamId) {
        for (let _ in this._groupsUnitList) {
            let unit = this._groupsUnitList[_];
            let memberData = unit.getMemberData(teamId);
            if (memberData) {
                return memberData;
            }
        }
        return null;
    }
    public isSelfLeader() {
        if (this._myGroupData == null) {
            return false;
        }
        let memberData = this._myGroupData.getGroupData();
        let is = memberData.checkLeaderIsSelf();
        return is;
    }
    public isInActiveScene() {
        if (this._myGroupData == null) {
            // cc.warn(' GroupsData:isInActiveScene _myGroupData  =========== false');
            return false;
        }
        let memberData = this._myGroupData.getGroupData();
        let is = memberData.isIs_scene();
        if (is == false) {
            // cc.warn('GroupsData:isInActiveScene memberData:isIs_scene  =========== false');
            return false;
        }
        return true;
    }
    public hasRedPoint() {
        if (this._myGroupData) {
            let applyListCount = this._myGroupData.getApplyListCount();
            if (applyListCount > 0) {
                return true;
            }
        }
        return false;
    }
    public c2sGetTeamsList(teamType) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetTeamList, { team_type: teamType });
    }
    public _s2cGetTeamList(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let teamType = message['team_type'] || 0;
        let teams = message['teams'] || {};
        let appteams = message['appteams'] || {};
        let unitData = new GroupsUnitData();
        unitData.updateData(teams);
        unitData.updateApplicationTime(appteams);
        this._groupsUnitList[teamType] = unitData;
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_LIST_GET, teamType);
    }
    public _s2cUpdateTeamInfo(id, message) {
        let update = message['update'];
        let delId = message['del'] || 0;
        let delTeamType = message['del_team_type'];
        let teamType = 0;
        if (update) {
            teamType = update['team_type'];
            let unitData = this.getGroupsUnitData(teamType);
            if (unitData) {
                unitData.updateData([update]);
            }
        }
        if (delId != 0) {
            teamType = delTeamType;
            let unitData = this.getGroupsUnitData(teamType);
            if (unitData) {
                unitData.removeGroupData(delId);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_LIST_UPDATE, teamType);
    }
    public c2sCreateTeam(teamType) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_CreateTeam, { team_type: teamType });
    }
    public _s2cCreateTeam(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let team = message['team'];
        let myGroupData = new GroupsMyMemberData();
        myGroupData.updateData(team);
        this._myGroupData = myGroupData;
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_MY_GROUP_CHAT_CHANGE);
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_CREATE_SUCCESS);
    }
    public _s2cUpdateMyTeam(id, message) {
        let team = message['team'];
        let isOnline = message['is_online'];
        if (isOnline) {
            this.reset();
            G_SignalManager.dispatch(SignalConst.EVENT_GROUP_DATA_RESET);
        }
        if (team) {
            if (this._myGroupData == null) {
                this._myGroupData = new GroupsMyMemberData();
                let teamInfo = team['team'];
                let teamId = teamInfo.team_id;
                let memberData = this._getMemberDataById(teamId);
                if (memberData) {
                    memberData.setApplyEndTime(0);
                }
            }
            this._myGroupData.updateData(team);
        } else {
            this._clearMyGroupData();
            G_SignalManager.dispatch(SignalConst.EVENT_GROUP_MY_GROUP_CHAT_CHANGE);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_MY_GROUP_INFO_UPDATE);
    }
    public c2sApplyTeam(teamType, teamId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_AppTeam, {
            team_type: teamType,
            team_id: teamId
        });
    }
    public _s2cApplyTeam(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let teamId = message['team_id'] || 0;
        let appTeam = message['app_team'] || [];
        let teamType = message['team_type'] || 0;
        let unitData = this.getGroupsUnitData(teamType);
        if (unitData) {
            for (let i in appTeam) {
                let id = appTeam[i];
                let memberData = unitData.getMemberData(id);
                if (memberData) {
                    let refuseJoinTime = GroupsDataHelper.getTeamInfoConfig(teamType).refuse_join_time;
                    let currTime = G_ServerTime.getTime();
                    memberData.setApplyEndTime(currTime + refuseJoinTime);
                    memberData.startCountDown();
                }
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_APPLY_JOIN_SUCCESS, teamType);
        if (appTeam.length == 0) {
            G_Prompt.showTip(Lang.get('groups_tips_28'));
        } else {
            if (teamId == 0) {
                G_Prompt.showTip(Lang.get('groups_tips_20'));
            } else {
                G_Prompt.showTip(Lang.get('groups_tips_1'));
            }
        }
    }
    public c2sLeaveTeam(leaveType) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_LeaveTeam, { leave_type: leaveType });
    }
    public _s2cLeaveTeam(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this._clearMyGroupData();
        let leaveType = message['leave_type'] || 0;
        if (leaveType == GroupsConst.NORMAL_QUIT) {
            G_Prompt.showTip(Lang.get('groups_tips_3'));
        } else if (leaveType == GroupsConst.LEADER_DISSOLVE) {
            G_Prompt.showTip(Lang.get('groups_tips_4'));
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_LEAVE_SUCCESS);
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_OUTSIDE_STATE);
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_MY_GROUP_CHAT_CHANGE);
    }
    public c2sChangeTeamSet(teamTarget, minLevel, maxLevel, teamAuto) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ChangeTeamSet, {
            team_target: teamTarget,
            min_level: minLevel,
            max_level: maxLevel,
            team_auto: teamAuto
        });
    }
    public _s2cChangeTeamSet(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let teamTarget = message['team_target'];
        let maxLevel = message['max_level'];
        let minLevel = message['min_level'];
        let teamAuto = message['team_auto'];
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_SET_CHANGE_SUCCESS);
    }
    public c2sTransferLeader(userId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_TransferLeader, { user_id: userId });
    }
    public _s2cTransferLeader(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let userId = message['user_id'] || 0;
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_TRANSFER_LEADER_SUCCESS, userId);
    }
    public c2sAppTransferLeader() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_AppTransferLeader, {});
    }
    public _s2cAppTransferLeader(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_REQUEST_TRANSFER_LEADER_TO_ME);
    }
    public _s2cAppTransferLeaderNotice(id, message) {
        let userId = message['user_id'];
        let userName = message['user_name'];
        if (this._myGroupData) {
            let teamType = this._myGroupData.getGroupData().getTeam_type();
            let typeCfg = GroupsDataHelper.getTeamInfoConfig(teamType);
            let agreeTime = typeCfg.agree_time;
            let endTime = agreeTime + G_ServerTime.getTime();
            GroupsViewHelper.popupAppTransferLeaderNotice(userId, userName, endTime);
        }
    }
    public c2sOpTransferLeader(userId, op) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_OpTransferLeader, {
            user_id: userId,
            op: op
        });
    }
    public _s2cOpTransferLeader(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let op = message['op'];
        let userId = message['user_id'];
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_OP_TRANSFER_LEADER, op, userId);
    }
    public _s2cInviteJoinTeamNotice(id, message) {
        let user = message['user'];
        let teamId = message['team_id'];
        let teamType = message['team_type'];
        let teamTarget = message['team_target'];
        let userData = new GroupsUserData();
        userData.updateData(user);
        let refuseTime = GroupsDataHelper.getTeamInfoConfig(teamType).refuse_time;
        let currTime = G_ServerTime.getTime();
        userData.setInviteEndTime(currTime + refuseTime);
        GroupsViewHelper.pushInvite(userData, teamId, teamType, teamTarget);
    }
    public c2sOpInviteJoinTeam(userId, op, teamId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_OpInviteJoinTeam, {
            user_id: userId,
            op: op,
            team_id: teamId
        });
    }
    public _s2cOpInviteJoinTeam(id, message) {
        let op = message['op'];
        let teamId = message['team_id'];
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_OP_INVITE_JOIN_GROUP, teamId, op);
    }
    public _s2cTeamTips(id, message) {
        let tipsType = message['tips_type'];
        let userName = message['user_name'];
        let userId = message['user_id'];
        let param = message['param'];
        if (tipsType == GroupsConst.STATE_KICK_OUT) {
            this._clearMyGroupData();
            G_SignalManager.dispatch(SignalConst.EVENT_GROUP_KICK_OUT);
            if (param == 1) {
                G_Prompt.showTip(Lang.get('groups_tips_29'));
                G_SignalManager.dispatch(SignalConst.EVENT_GROUP_OUTSIDE_STATE, GroupsConst.OUTSIDE_REASON_1);
            } else {
                G_Prompt.showTip(Lang.get('groups_tips_6'));
                G_SignalManager.dispatch(SignalConst.EVENT_GROUP_OUTSIDE_STATE);
            }
        } else if (tipsType == GroupsConst.STATE_REJECT_TRANSFER_LEADER) {
            G_Prompt.showTip(Lang.get('groups_tips_5', { name: userName }));
            G_SignalManager.dispatch(SignalConst.EVENT_GROUP_REJECT_TRANSFER_LEADER);
        } else if (tipsType == GroupsConst.STATE_DISSOLVE) {
            let isSelfLeader = this.isSelfLeader();
            this._clearMyGroupData();
            G_SignalManager.dispatch(SignalConst.EVENT_GROUP_DISSOLVE);
            if (param == 2) {
                G_Prompt.showTip(Lang.get('groups_tips_30', { name: userName }));
                G_SignalManager.dispatch(SignalConst.EVENT_GROUP_OUTSIDE_STATE, GroupsConst.OUTSIDE_REASON_2);
            } else {
                if (isSelfLeader == false) {
                    G_Prompt.showTip(Lang.get('groups_tips_7', { name: userName }));
                }
                G_SignalManager.dispatch(SignalConst.EVENT_GROUP_OUTSIDE_STATE);
            }
        } else if (tipsType == GroupsConst.STATE_REJECT_APPLY) {
            G_Prompt.showTip(Lang.get('groups_tips_11', { name: userName }));
            let teamId = param;
            let memberData = this._getMemberDataById(teamId);
            if (memberData) {
                memberData.setApplyEndTime(0);
            }
            G_SignalManager.dispatch(SignalConst.EVENT_GROUP_REJECT_MY_APPLY);
        } else if (tipsType == GroupsConst.STATE_REJECT_INVITE) {
            G_Prompt.showTip(Lang.get('groups_tips_13', { name: userName }));
            if (this._myGroupData) {
                this._myGroupData.removeInviteDataById(userId);
                G_SignalManager.dispatch(SignalConst.EVENT_GROUP_REJECT_INVITE);
            }
        } else if (tipsType == GroupsConst.STATE_AGREE_INVITE) {
            if (this._myGroupData) {
                this._myGroupData.removeInviteDataById(userId);
                G_SignalManager.dispatch(SignalConst.EVENT_GROUP_ACCEPT_INVITE);
            }
        } else if (tipsType == GroupsConst.STATE_JOIN_GROUP) {
            G_Prompt.showTip(Lang.get('groups_tips_14', { name: userName }));
            if (this._myGroupData) {
                this._myGroupData.removeInviteDataById(userId);
                G_SignalManager.dispatch(SignalConst.EVENT_GROUP_JOIN_SUCCESS);
            }
        } else if (tipsType == GroupsConst.STATE_JOIN_GROUP_LACK_TIME) {
            G_Prompt.showTip(Lang.get('groups_tips_21'));
        } else if (tipsType == GroupsConst.STATE_CUT_TIME) {
            G_Prompt.showTipOnTop(Lang.get('groups_tips_22', { second: param }));
        } else if (tipsType == GroupsConst.STATE_GET_LEADER_SUCCEED) {
            G_Prompt.showTip(Lang.get('groups_tips_23'));
            G_SignalManager.dispatch(SignalConst.EVENT_GROUP_GET_LEADER_SUCCESS);
        } else if (tipsType == GroupsConst.STATE_SET_LEADER_SUCCEED) {
            G_Prompt.showTip(Lang.get('groups_tips_24'));
            G_SignalManager.dispatch(SignalConst.EVENT_GROUP_SET_LEADER_SUCCESS);
        }
    }
    public c2sTeamEnterScene(teamType) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_TeamEnterScene, { team_type: teamType });
    }
    public _s2cTeamEnterScene(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let teamType = message['team_type'];
    }
    public c2sOpEnterScene(op) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_OpEnterScene, { op: op });
    }
    public _s2cOpEnterScene(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let op = message['op'];
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_OP_ENTER_SCENE, op);
    }
    public _s2cSyncApplyTeamList(id, message) {
        let appTeamList = message['app_team_list'] || {};
        for (let i in appTeamList) {
            let info = appTeamList[i];
            let teamId = info.team_id;
            let appTime = info.app_time;
            let memberData = this._getMemberDataById(teamId);
            if (memberData) {
                let teamType = memberData.getTeam_type();
                let refuseJoinTime = GroupsDataHelper.getTeamInfoConfig(teamType).refuse_join_time;
                memberData.setApplyEndTime(appTime + refuseJoinTime);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_SYNC_APPLY_LIST);
    }
}
