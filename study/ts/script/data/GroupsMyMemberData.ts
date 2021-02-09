import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_ServerTime, G_Prompt } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { GroupsMemberData } from "./GroupsMemberData";
import { GroupsViewHelper } from "../scene/view/groups/GroupsViewHelper";
import { SignalConst } from "../const/SignalConst";
import { GroupsUserData } from "./GroupsUserData";
import { GroupsDataHelper } from "../utils/data/GroupsDataHelper";
import { GroupsInviteData } from "./GroupsInviteData";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { GroupsConst } from "../const/GroupsConst";
import { Lang } from "../lang/Lang";
import { GroupsPreSceneData } from "./GroupsPreSceneData";

export interface GroupsMyMemberData {
    isTeam_auto(): boolean
    setTeam_auto(value: boolean): void
    isLastTeam_auto(): boolean
}
let schema = {};
schema['team_auto'] = [
    'boolean',
    false
];
export class GroupsMyMemberData extends BaseData {
    public static schema = schema;

    _groupData;
    _applyList;
    _inviteList;
    _preSceneInfo;
    _lastUserCount;
    _recvUpdateTeamApplyList;
    _recvSyncInviteList;
    _recvInviteJoinTeam;
    _recvApproveTeam;
    _recvUpdateEnterSceneState;
    _recvTeamKick;
    _recvTeamChangeMemberNo;
    constructor(properties?) {
        super(properties);
        this._groupData = null;
        this._applyList = {};
        this._inviteList = {};
        this._preSceneInfo = null;
        this._lastUserCount = 0;
        this._recvUpdateTeamApplyList = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateTeamAppList, this._s2cUpdateTeamApplyList.bind(this));
        this._recvSyncInviteList = G_NetworkManager.add(MessageIDConst.ID_S2C_SyncInviteList, this._s2cSyncInviteList.bind(this));
        this._recvInviteJoinTeam = G_NetworkManager.add(MessageIDConst.ID_S2C_InviteJoinTeam, this._s2cInviteJoinTeam.bind(this));
        this._recvApproveTeam = G_NetworkManager.add(MessageIDConst.ID_S2C_ApproveTeam, this._s2cApproveTeam.bind(this));
        this._recvUpdateEnterSceneState = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateEnterSceneState, this._s2cUpdateEnterSceneState.bind(this));
        this._recvTeamKick = G_NetworkManager.add(MessageIDConst.ID_S2C_TeamKick, this._s2cTeamKick.bind(this));
        this._recvTeamChangeMemberNo = G_NetworkManager.add(MessageIDConst.ID_S2C_TeamChangeMemberNo, this._s2cTeamChangeMemberNo.bind(this));
    }
    public clear() {
        this.reset();
        this._recvUpdateTeamApplyList.remove();
        this._recvUpdateTeamApplyList = null;
        this._recvSyncInviteList.remove();
        this._recvSyncInviteList = null;
        this._recvInviteJoinTeam.remove();
        this._recvInviteJoinTeam = null;
        this._recvApproveTeam.remove();
        this._recvApproveTeam = null;
        this._recvUpdateEnterSceneState.remove();
        this._recvUpdateEnterSceneState = null;
        this._recvTeamKick.remove();
        this._recvTeamKick = null;
        this._recvTeamChangeMemberNo.remove();
        this._recvTeamChangeMemberNo = null;
    }
    public reset() {
        this._groupData = null;
        this._applyList = {};
        this._inviteList = {};
        this._preSceneInfo = null;
        this._lastUserCount = 0;
    }
    public getGroupData() {
        return this._groupData;
    }
    public getApplyList() {
        return this._applyList;
    }
    public getApplyListCount() {
        let count = 0;
        for (let k in this._applyList) {
            let v = this._applyList[k];
            count = count + 1;
        }
        return count;
    }
    public getInviteList() {
        return this._inviteList;
    }
    public getInviteListCount() {
        let count = 0;
        for (let k in this._inviteList) {
            let v = this._inviteList[k];
            count = count + 1;
        }
        return count;
    }
    public getPreSceneInfo() {
        return this._preSceneInfo;
    }
    public updateData(message) {
        let teamAuto = message['team_auto'];
        let team = message['team'];
        this.setTeam_auto(teamAuto);
        if (this._groupData == null) {
            this._groupData = new GroupsMemberData();
        }
        this._groupData.updateData(team);
        this._checkPopupEnterTip();
    }
    public _checkPopupEnterTip() {
        let count = this._groupData.getUserCount();
        let diffCount = count - this._lastUserCount;
        this._lastUserCount = count;
        if (diffCount != 0 && this._groupData.isSelfGroup() && !this._groupData.isIs_scene() && this._groupData.isFull() && this._groupData.checkLeaderIsSelf()) {
            GroupsViewHelper.popupEnterActiveScene(this._groupData);
            G_SignalManager.dispatch(SignalConst.EVENT_GROUP_MEMBER_REACH_FULL);
        }
    }
    public getInviteUserData(userId) {
        return this._inviteList[userId];
    }
    public removeInviteDataById(userId) {
        if (this._inviteList[userId]) {
            this._inviteList[userId].clear();
            this._inviteList[userId] = null;
        }
    }
    public removeApplyDataWithId(userId) {
        if (this._applyList[userId]) {
            // this._applyList[userId].clear();
            // this._applyList[userId] = null;
            delete this._applyList[userId];
        }
    }
    public isExistUser(userId) {
        let userData = this._groupData.getUserData(userId);
        if (userData) {
            return true;
        } else {
            return false;
        }
    }
    public isAwardAdd() {
        let count = this._groupData.getUserCount();
        if (count <= 1) {
            return false;
        }
        let userList = this._groupData.getUserList();
        let name = null;
        for (let k in userList) {
            let userData = userList[k];
            if (userData.isInGuild() == false) {
                return false;
            }
            if (name == null) {
                name = userData.getGuild_name();
            }
            if (name != userData.getGuild_name()) {
                return false;
            }
        }
        return true;
    }
    public _s2cUpdateTeamApplyList(id, message) {
        let user = message['update'];
        let userId = user['user_id'];
        let userData = this._applyList[userId];
        if (userData == null) {
            userData = new GroupsUserData();
        }
        userData.updateData(user);
        let groupType = this._groupData.getTeam_type();
        let refuseJoinTime = GroupsDataHelper.getTeamInfoConfig(groupType).refuse_join_time;
        let currTime = G_ServerTime.getTime();
        userData.setApplyEndTime(currTime + refuseJoinTime);
        userData.startCountDown();
        this._applyList[userId] = userData;
        GroupsViewHelper.pushApply(userData);
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_APPLY_LIST_UPDATE);
    }
    public _s2cSyncInviteList(id, message) {
        let inviteList = message['invite_list'] || {};
        for (let i in inviteList) {
            let data = inviteList[i];
            let inviteData = new GroupsInviteData();
            inviteData.updateData(data);
            let userId = inviteData.getUser_id();
            this._inviteList[userId] = inviteData;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_SYNC_INVITE_LIST);
    }
    public c2sInviteJoinTeam(userId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_InviteJoinTeam, { user_id: userId });
    }
    public _s2cInviteJoinTeam(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let userId = message['user_id'] || 0;
        let groupType = this._groupData.getTeam_type();
        let info = GroupsDataHelper.getTeamInfoConfig(groupType);
        let inviteEndTime = info.refuse_time + G_ServerTime.getTime();
        let inviteData = new GroupsInviteData();
        inviteData.setUser_id(userId);
        inviteData.setInvite_time(inviteEndTime);
        this._inviteList[userId] = inviteData;
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_INVITE_JOIN_GROUP_SUCCEED, userId);
    }
    public c2sApproveTeam(userId, op) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ApproveTeam, {
            user_id: userId,
            op: op
        });
    }
    public _s2cApproveTeam(id, message) {
        let userId = message['user_id'] || 0;
        let op = message['op'];
        if (userId != 0) {
            this.removeApplyDataWithId(userId);
        }
        if (op == GroupsConst.NO) {
            G_Prompt.showTip(Lang.get('groups_tips_10'));
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_APPROVE_APPLY_SUCCESS, userId, op);
    }
    public _s2cUpdateEnterSceneState(id, message) {
        if (this._preSceneInfo == null) {
            this._preSceneInfo = new GroupsPreSceneData();
        }
        this._preSceneInfo.updateData(message);
        if (this._preSceneInfo.isFirst()) {
            GroupsViewHelper.popupGroupsAgreementDlg();
        } else {
            G_SignalManager.dispatch(SignalConst.EVENT_GROUP_UPDATE_ENTER_SCENE_STATE);
        }
    }
    public c2sTeamKick(userId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_TeamKick, { user_id: userId });
    }
    public _s2cTeamKick(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let userId = message['user_id'] || 0;
        this._groupData.removeUserById(userId);
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_MY_GROUP_KICK_USER);
        G_Prompt.showTip(Lang.get('groups_tips_8'));
    }
    public c2sTeamChangeMemberNo(oldNo, newNo) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_TeamChangeMemberNo, {
            old_no: oldNo,
            new_no: newNo
        });
    }
    public _s2cTeamChangeMemberNo(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GROUP_CHANGE_LOCATION_SUCCESS);
        G_Prompt.showTip(Lang.get('groups_tips_9'));
    }
}
