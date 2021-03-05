const { ccclass, property } = cc._decorator;

import GroupsTipBar from '../../../ui/GroupsTipBar';
import { G_SignalManager, G_UserData, G_SceneManager, G_Prompt } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { GroupsConst } from '../../../const/GroupsConst';
import { Lang } from '../../../lang/Lang';

@ccclass
export default class GroupsMainNode extends GroupsTipBar {

    private _userData = null;
    private _type = 0;
    private _teamId = 0;

    private _signalJoinInfoChange;
    private _signalApproveInfoChange;
    private _signalOutSideState;
    private _signalDataClear;

    public onCreate() {
        super.onCreate();
    }

    public onEnter() {
        this._signalJoinInfoChange = G_SignalManager.add(SignalConst.EVENT_GROUP_OP_INVITE_JOIN_GROUP, handler(this, this._onOpInviteJoinGroup));
        this._signalApproveInfoChange = G_SignalManager.add(SignalConst.EVENT_GROUP_APPROVE_APPLY_SUCCESS, handler(this, this._onOpApproveChange));
        this._signalOutSideState = G_SignalManager.add(SignalConst.EVENT_GROUP_OUTSIDE_STATE, handler(this, this._onOutSideState));
        this._signalDataClear = G_SignalManager.add(SignalConst.EVENT_GROUP_DATA_CLEAR, handler(this, this._onDataClear));
        this._updateTips();
    }

    public onExit() {
        this._signalJoinInfoChange.remove();
        this._signalJoinInfoChange = null;
        this._signalApproveInfoChange.remove();
        this._signalApproveInfoChange = null;
        this._signalOutSideState.remove();
        this._signalOutSideState = null;
        this._signalDataClear.remove();
        this._signalDataClear = null;
    }

    private _updateTips() {
        var isTip = G_UserData.getGroups().isTipInvite();
        var isSelected = !isTip;
        this._checkBoxTip.checkMark.node.active = (isSelected);
    }

    public setParam(userData, type?, teamId?) {
        this._userData = userData;
        this._type = type || 0;
        this._teamId = teamId || 0;
    }

    public slideOut(data, filterViewNames) {
        if (G_SceneManager.getRunningSceneName() == 'guildTrain' && !G_UserData.getGuild().getTrainEndState()) {
            return;
        }
        super.slideOut(data, filterViewNames);
    }

    private _onOpInviteJoinGroup(event, teamId, op) {
        if (this._teamId == teamId) {
            if (op == GroupsConst.NO) {
                G_Prompt.showTip(Lang.get('groups_tips_12'));
            }
            this.closeWindow();
        }
    }

    private _onOpApproveChange(event, userId, op) {
        if (this._userData.getUser_id() == userId) {
            this.closeWindow();
        }
    }

    private _onOutSideState(event) {
        if (this._type == GroupsConst.APPLY) {
            this.closeWindow();
        }
    }

    private _onDataClear(event) {
        this.node.removeFromParent();
    }

    public onBtnCancel() {
        var userId = this._userData.getUser_id();
        if (this._type == GroupsConst.APPLY) {
            var myGroupData = G_UserData.getGroups().getMyGroupData();
            if (myGroupData) {
                myGroupData.c2sApproveTeam(userId, GroupsConst.NO);
            }
        } else if (this._type == GroupsConst.INVITE) {
            G_UserData.getGroups().c2sOpInviteJoinTeam(userId, GroupsConst.NO, this._teamId);
        }
    }

    public onBtnOk() {
        var userId = this._userData.getUser_id();
        if (this._type == GroupsConst.APPLY) {
            var myGroupData = G_UserData.getGroups().getMyGroupData();
            if (myGroupData) {
                myGroupData.c2sApproveTeam(userId, GroupsConst.OK);
            }
        } else if (this._type == GroupsConst.INVITE) {
            G_UserData.getGroups().c2sOpInviteJoinTeam(userId, GroupsConst.OK, this._teamId);
        }
    }

    public onCheckBoxClicked() {
        G_UserData.getGroups().setTipInvite(!this._checkBoxTip.isChecked);
    }
}