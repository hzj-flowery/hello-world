const { ccclass, property } = cc._decorator;

import CommonHelp from '../../../ui/component/CommonHelp'
import CommonGroupsActiveTimeNode from '../../../ui/component/CommonGroupsActiveTimeNode'
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'
import ViewBase from '../../ViewBase';
import { G_SignalManager, G_UserData, G_SceneManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { GroupsDataHelper } from '../../../utils/data/GroupsDataHelper';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { handler } from '../../../utils/handler';
import { GroupsConst } from '../../../const/GroupsConst';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { ChatConst } from '../../../const/ChatConst';
import GroupsListView from './GroupsListView';
import GroupsInfoView from './GroupsInfoView';

@ccclass
export default class GroupsView extends ViewBase {

    @property({ type: cc.Node, visible: true })
    _panelRoot: cc.Node = null;

    @property({ type: CommonTopbarBase, visible: true })
    _topbarBase: CommonTopbarBase = null;

    @property({ type: CommonGroupsActiveTimeNode, visible: true })
    _nodeTime: CommonGroupsActiveTimeNode = null;

    @property({ type: cc.Node, visible: true })
    _panelDesign: cc.Node = null;

    @property({ type: CommonHelp, visible: true })
    _commonHelp: CommonHelp = null;

    @property({ type: cc.Button, visible: true })
    _btnChat: cc.Button = null;

    @property({ type: cc.Sprite, visible: true })
    _imageChatRp: cc.Sprite = null;

    @property({ type: cc.Prefab, visible: true })
    _groupsListViewPrefab: cc.Prefab = null;

    @property({ type: cc.Prefab, visible: true })
    _groupsInfoViewPrefab: cc.Prefab = null;

    private _functionId;
    private _showView: GroupsListView | GroupsInfoView[];
    private _groupType;
    private _showType;

    private _signalGroupCreate;
    private _signalMyGroupUpdate;
    private _signalLeaveSuccess;
    private _signalKickOut;
    private _signalEnterGraveScene;
    private _signalGroupDissolve;
    private _signalRedPointUpdateChat;

    public static waitEnterMsg(callBack, param) {
        function onMsgCallBack() {
            callBack();
            msgReg.remove();
            msgReg = null;
        }
        var msgReg = G_SignalManager.add(SignalConst.EVENT_GROUP_LIST_GET, onMsgCallBack);
        if (param) {
            let functionId = param[0];
            var groupType = GroupsDataHelper.getGroupIdWithFunctionId(functionId);
            G_UserData.getGroups().c2sGetTeamsList(groupType);
        }
        return msgReg;
    }

    public onCreate() {
        this.setSceneSize();
        this._functionId = G_SceneManager.getViewArgs()[0];
        this._initData();
        this._initView();
    }

    private _initData() {
        this._showView = [];
        this._groupType = GroupsDataHelper.getGroupIdWithFunctionId(this._functionId);
        this._showType = 0;
    }

    private _initView() {
        this._topbarBase.setImageTitle('txt_sys_qintombo');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_QINTOMB);
        this._commonHelp.updateUI(FunctionConst.FUNC_MAUSOLEUM);
    }

    public onEnter() {
        this._signalGroupCreate = G_SignalManager.add(SignalConst.EVENT_GROUP_CREATE_SUCCESS, handler(this, this._onGroupCreate));
        this._signalMyGroupUpdate = G_SignalManager.add(SignalConst.EVENT_GROUP_MY_GROUP_INFO_UPDATE, handler(this, this._onMyGroupUpdate));
        this._signalLeaveSuccess = G_SignalManager.add(SignalConst.EVENT_GROUP_LEAVE_SUCCESS, handler(this, this._onLeaveSuccess));
        this._signalKickOut = G_SignalManager.add(SignalConst.EVENT_GROUP_KICK_OUT, handler(this, this._onKickOut));
        this._signalEnterGraveScene = G_SignalManager.add(SignalConst.EVENT_GRAVE_ENTER_SCENE, handler(this, this._onEventEnterGraveScene));
        this._signalGroupDissolve = G_SignalManager.add(SignalConst.EVENT_GROUP_DISSOLVE, handler(this, this._onGroupDissolve));
        this._signalRedPointUpdateChat = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._updateData();
        this._updateView();
        this._checkChatRedPoint();
        this._nodeTime.updateUIOfStatic();
    }

    public onExit() {
        this._signalGroupCreate.remove();
        this._signalGroupCreate = null;
        this._signalMyGroupUpdate.remove();
        this._signalMyGroupUpdate = null;
        this._signalLeaveSuccess.remove();
        this._signalLeaveSuccess = null;
        this._signalKickOut.remove();
        this._signalKickOut = null;
        this._signalEnterGraveScene.remove();
        this._signalEnterGraveScene = null;
        this._signalGroupDissolve.remove();
        this._signalGroupDissolve = null;
        this._signalRedPointUpdateChat.remove();
        this._signalRedPointUpdateChat = null;
    }

    private _updateData() {
        if (G_UserData.getGroups().getMyGroupData()) {
            this._showType = GroupsConst.SHOW_INFO;
        } else {
            this._showType = GroupsConst.SHOW_LIST;
        }
    }

    private _updateView() {
        var curView = this._showView[this._showType - 1];
        if (curView == null) {
            if (this._showType == GroupsConst.SHOW_LIST) {
                curView = cc.instantiate(this._groupsListViewPrefab).getComponent(GroupsListView);
                curView.init(this._groupType);
            } else if (this._showType == GroupsConst.SHOW_INFO) {
                curView = cc.instantiate(this._groupsInfoViewPrefab).getComponent(GroupsInfoView);
            }
            if (curView) {
                this._panelRoot.addChild(curView.node);
                this._showView[this._showType - 1] = curView;
            }
        }
        for (let k in this._showView) {
            var subView = this._showView[k];
            subView.node.active = (false);
        }
        curView.node.active = (true);
        curView.refreshView();
    }

    private _onEventEnterGraveScene() {
    }

    private _onKickOut() {
        this._updateData();
        this._updateView();
    }

    private _onGroupCreate() {
        this._updateData();
        this._updateView();
    }

    private _onMyGroupUpdate() {
        this._updateData();
        this._updateView();
    }

    private _onLeaveSuccess() {
        this._updateData();
        this._updateView();
    }

    private _onGroupDissolve() {
        this._updateData();
        this._updateView();
    }

    public onOpenChatView() {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_CHAT);
        this._imageChatRp.node.active = (false);
    }

    private _checkChatRedPoint() {
        var red = RedPointHelper.isModuleReach(FunctionConst.FUNC_CHAT, ChatConst.CHANNEL_TEAM);
        this._imageChatRp.node.active = (red);
    }

    private _onEventRedPointUpdate(event, funcId) {
        if (funcId == FunctionConst.FUNC_CHAT) {
            this._checkChatRedPoint();
        }
    }
}