const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'
import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'
import CommonCheckBoxHintToRight from '../../../ui/component/CommonCheckBoxHintToRight'
import GroupHeroNode from './GroupHeroNode'
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { GroupsConst } from '../../../const/GroupsConst';
import { G_SignalManager, G_SceneManager, G_UserData, G_Prompt } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { GroupsDataHelper } from '../../../utils/data/GroupsDataHelper';
import { Path } from '../../../utils/Path';
import PopupSystemAlert from '../../../ui/PopupSystemAlert';
import { GroupsViewHelper } from './GroupsViewHelper';
import { ChatConst } from '../../../const/ChatConst';
import ViewBase from '../../ViewBase';

@ccclass
export default class GroupsInfoNode extends ViewBase {

    @property({ type: cc.Node, visible: true })
    _panel: cc.Node = null;

    @property({ type: GroupHeroNode, visible: true })
    _nodeHero1: GroupHeroNode = null;

    @property({ type: GroupHeroNode, visible: true })
    _nodeHero2: GroupHeroNode = null;

    @property({ type: GroupHeroNode, visible: true })
    _nodeHero3: GroupHeroNode = null;

    @property({ type: cc.Label, visible: true })
    _textAwardTips: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _imageArrow: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageAuto: cc.Sprite = null;

    @property({ type: CommonCheckBoxHintToRight, visible: true })
    _ckbAuto: CommonCheckBoxHintToRight = null;

    @property({ type: cc.Button, visible: true })
    _btnLock: cc.Button = null;

    @property({ type: cc.Label, visible: true })
    _btnLockText: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _nodeBtns: cc.Node = null;

    @property({ type: CommonButtonLevel0Normal, visible: true })
    _btnOut: CommonButtonLevel0Normal = null;

    @property({ type: CommonButtonLevel0Normal, visible: true })
    _btnApply: CommonButtonLevel0Normal = null;

    @property({ type: cc.Button, visible: true })
    _btnAdd: cc.Button = null;

    @property({ type: cc.Label, visible: true })
    _btnAddText: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _addMenuRoot: cc.Node = null;

    @property({ type: cc.Button, visible: true })
    _btnWorld: cc.Button = null;

    @property({ type: cc.Label, visible: true })
    _btnWorldText: cc.Label = null;

    @property({ type: cc.Button, visible: true })
    _btnGuild: cc.Button = null;

    @property({ type: cc.Label, visible: true })
    _btnGuildText: cc.Label = null;

    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _btnGo: CommonButtonLevel0Highlight = null;

    @property({ type: cc.Sprite, visible: true })
    _imageTip: cc.Sprite = null;


    private _myMemberData;
    private _memberData: any;
    private _isSelfLeader;
    private _isInScene;
    private _isLock;
    private _isAuto;
    private _originalPos;
    private _targetPos;
    private _isTouch;
    private _configInfo;
    private _curSelectedMemberNode: cc.Node;
    private _distanceX;
    private _distanceY;

    private _signalTransferLeader;
    private _signalKickUser;
    private _signalChangeLocation;
    private _signalSetChangeSuccess;
    private _signalApplyListUpdate;
    private _signalApplyTimeOut;
    private _signalApproveInfoChange;

    private _memberLoction2Data: { [key: number]: { node: cc.Node, pos: cc.Vec2, hero: GroupHeroNode } };

    public onCreate() {
        this._initData();
        this._initView();
    }

    private _initData() {
        this._myMemberData = null;
        this._memberData = null;
        this._isSelfLeader = false;
        this._isInScene = false;
        this._isLock = true;
        this._isAuto = false;
        this._originalPos = 0;
        this._targetPos = 0;
        this._isTouch = false;
    }

    private _initView() {
        this._btnAddText.string = Lang.get('groups_btn_name_add');
        this._btnApply.setString(Lang.get('groups_btn_name_apply'));
        this._btnGo.setString(Lang.get('groups_btn_name_go'));
        this._btnOut.setString(Lang.get('groups_btn_name_out'));
        this._btnWorldText.string = (Lang.get('groups_btn_world_add'));
        this._btnGuildText.string = (Lang.get('groups_btn_guild_add'));
        this._ckbAuto.setString(Lang.get('groups_auto_join_content'));
        this._ckbAuto.setChangeCallBack(handler(this, this._onClickCheckBox));
        this._addMenuRoot.active = (false);
        this._textAwardTips.string = (Lang.get('groups_tips_31'));
        this._memberLoction2Data = {};

        let groupHeroNodes: GroupHeroNode[] = [this._nodeHero1, this._nodeHero2, this._nodeHero3];
        for (let i = 0; i < GroupsConst.MAX_PLAYER_SIZE; i++) {
            groupHeroNodes[i].init(handler(this, this._onClickAdd), handler(this, this._onClickOut));
            this._memberLoction2Data[i + 1] = {
                node: groupHeroNodes[i].node,
                pos: groupHeroNodes[i].node.getPosition(),
                hero: groupHeroNodes[i]
            };
        }
    }

    public onEnter() {
        this._signalTransferLeader = G_SignalManager.add(SignalConst.EVENT_GROUP_TRANSFER_LEADER_SUCCESS, handler(this, this._onTransferLeaderSuccess));
        this._signalKickUser = G_SignalManager.add(SignalConst.EVENT_GROUP_MY_GROUP_KICK_USER, handler(this, this._onKickUserSuccess));
        this._signalChangeLocation = G_SignalManager.add(SignalConst.EVENT_GROUP_CHANGE_LOCATION_SUCCESS, handler(this, this._onChangeLocation));
        this._signalSetChangeSuccess = G_SignalManager.add(SignalConst.EVENT_GROUP_SET_CHANGE_SUCCESS, handler(this, this._onSetChangeSuccess));
        this._signalApplyListUpdate = G_SignalManager.add(SignalConst.EVENT_GROUP_APPLY_LIST_UPDATE, handler(this, this._onApplyListUpdate));
        this._signalApplyTimeOut = G_SignalManager.add(SignalConst.EVENT_GROUP_APPLY_TIME_OUT, handler(this, this._onApplyTimeOut));
        this._signalApproveInfoChange = G_SignalManager.add(SignalConst.EVENT_GROUP_APPROVE_APPLY_SUCCESS, handler(this, this._onOpApproveChange));
        var runningScene = G_SceneManager.getRunningScene();
        runningScene.addGetUserBaseInfoEvent();

      //  this._addTouchEvent();
    }

    public onExit() {
        this._signalTransferLeader.remove();
        this._signalTransferLeader = null;
        this._signalKickUser.remove();
        this._signalKickUser = null;
        this._signalChangeLocation.remove();
        this._signalChangeLocation = null;
        this._signalSetChangeSuccess.remove();
        this._signalSetChangeSuccess = null;
        this._signalApplyListUpdate.remove();
        this._signalApplyListUpdate = null;
        this._signalApplyTimeOut.remove();
        this._signalApplyTimeOut = null;
        this._signalApproveInfoChange.remove();
        this._signalApproveInfoChange = null;
    }

    public updateInfo() {
        this._updateData();
        this._updateView();
    }

    private _updateData() {
        this._myMemberData = G_UserData.getGroups().getMyGroupData();
        this._memberData = this._myMemberData.getGroupData();
        var targetId = this._memberData.getTeam_target();
        this._configInfo = GroupsDataHelper.getTeamTargetConfig(targetId);
        this._isSelfLeader = G_UserData.getGroups().isSelfLeader();
        this._isInScene = this._memberData.isIs_scene();
        this._isAuto = this._myMemberData.isTeam_auto();
    }

    private _updateView() {
        this._updateAwardTip();
        this._updateHeros();
        this._layoutBtns();
        this._updateLock();
        this._updateAuto();
        this._checkApplyRedPoint();
    }

    private _updateAwardTip() {
        if (this._myMemberData.isAwardAdd()) {
            this._textAwardTips.node.color = (cc.color(60, 255, 0));
            this._imageArrow.node.active = (true);
        } else {
            this._textAwardTips.node.color = (cc.color(125, 125, 125));
            this._imageArrow.node.active = (false);
        }
    }

    private _updateHeros() {
        for (var i = 1; i <= GroupsConst.MAX_PLAYER_SIZE; i++) {
            var userData = this._memberData.getUserDataWithLocation(i);
            var hero = this._memberLoction2Data[i].hero;
            hero.updataUI(userData);
            hero.getHeroAvatar().setTouchEnabled(this._isLock);
        }
    }

    private _layoutBtns() {
        var btns: cc.Node[] = [
            this._btnGo.node,
            this._btnApply.node,
            this._btnAdd.node,
            this._btnLock.node
        ];
        var showBtns: cc.Node[] = [];
        if (this._isInScene) {
            if (this._isSelfLeader) {
                showBtns = [
                    this._btnApply.node,
                    this._btnAdd.node,
                    this._btnLock.node
                ];
            } else {
                showBtns = [this._btnAdd.node];
            }
        } else {
            if (this._isSelfLeader) {
                showBtns = [
                    this._btnGo.node,
                    this._btnApply.node,
                    this._btnAdd.node,
                    this._btnLock.node
                ];
            } else {
                showBtns = [this._btnAdd.node];
            }
        }
        for (let i in btns) {
            var btn = btns[i];
            btn.active = (false);
        }
        for (let i in showBtns) {
            var btn = showBtns[i];
            btn.active = (true);
        }
    }

    private _updateLock() {
        if (this._isLock) {
            this._btnLockText.string = (Lang.get('groups_member_btn_adjust'));
        } else {
            this._btnLockText.string = (Lang.get('groups_member_btn_confirm'));
        }
        this._nodeBtns.active = (this._isLock);
        this._imageTip.node.active = (!this._isLock);
        if (this._isSelfLeader && !this._isLock) {
            this._addTouchEvent();
        }
        else {
            this._removeTouchEvent();
        }
        this._ckbAuto.setTouchEnabled(this._isLock);
        for (var i = 1; i <= GroupsConst.MAX_PLAYER_SIZE; i++) {
            var hero = this._memberLoction2Data[i].hero;
            hero.getHeroAvatar().setTouchEnabled(this._isLock);
        }
    }

    private _updateAuto() {
        this._imageAuto.node.active = (this._isSelfLeader);
        this._ckbAuto.setSelected(this._isAuto);
    }

    private _onClickOut(userData) {
        if (this._isLock == false) {
            return;
        }
        if (userData) {
            let onBtnGo = function () {
                this._myMemberData.c2sTeamKick(userData.getUser_id());
            }.bind(this);
            G_SceneManager.openPopup(Path.getPrefab("PopupSystemAlert", "common"), (popup: PopupSystemAlert) => {
                popup.setup(Lang.get('groups_kick_title'), Lang.get('groups_kick_content', { name: userData.getName() }), onBtnGo);
                popup.setCheckBoxVisible(false);
                popup.setCloseVisible(true);
                popup.openWithAction();
            });
        }
    }

    private _onClickAdd(sender) {
        if (this._isLock == false) {
            return;
        }
        G_SceneManager.openPopup(Path.getPrefab("PopupGroupsInviteView", "groups"));
    }

    private _checkIsSelectedMember(sender: cc.Touch) {
        var pos = sender.getStartLocation();
        for (var i = 1; i <= GroupsConst.MAX_PLAYER_SIZE; i++) {
            var hero = this._memberLoction2Data[i].hero;
            if (!hero.isEmpty()) {
                var location: any = hero.getHeroAvatar().getSpineHero().convertToNodeSpaceAR(pos);
                var rect = hero.getHeroAvatar().getSpineHero().getBoundingBox();
                if (rect.contains(location)) {
                    return i;
                }
            }
        }
        return null;
    }

    private _onMemberSelected(target: cc.Node) {
        if (this._isTouch != true) {
            return;
        }
        this._curSelectedMemberNode = target;
        this._curSelectedMemberNode.setScale(1.12);
        this._curSelectedMemberNode.opacity = (180);
        this._curSelectedMemberNode.zIndex = (100);
    }

    private _checkMoveHit(location) {
        this._targetPos = 0;
        for (var i = 1; i <= GroupsConst.MAX_PLAYER_SIZE; i++) {
            if (this._originalPos != i) {
                var node = this._memberLoction2Data[i].node;
                var rect = node.getBoundingBox();
                var width = rect.width;
                var height = rect.height;
                rect.x = rect.x - width / 2;
                rect.y = rect.y - height / 2;
                if (rect.contains(location)) {
                    this._targetPos = i;
                }
            }
        }
    }

    private _onMemberUnselected() {
        if (this._targetPos > 0) {
            var hero = this._memberLoction2Data[this._targetPos].hero;
            if (hero.isEmpty()) {
                G_Prompt.showTip(Lang.get('groups_tips_26'));
            } else {
                var targetNode = this._memberLoction2Data[this._targetPos].node;
                var originalNode = this._memberLoction2Data[this._originalPos].node;
                var targetHero = this._memberLoction2Data[this._targetPos].hero;
                var originalHero = this._memberLoction2Data[this._originalPos].hero;
                this._memberLoction2Data[this._targetPos].node = originalNode;
                this._memberLoction2Data[this._originalPos].node = targetNode;
                this._memberLoction2Data[this._targetPos].hero = originalHero;
                this._memberLoction2Data[this._originalPos].hero = targetHero;
                this._myMemberData.c2sTeamChangeMemberNo(this._originalPos, this._targetPos);
            }
        }
        this._curSelectedMemberNode.setScale(1);
        this._curSelectedMemberNode.opacity = (255);
        this._updateMemberPos();
    }

    private _updateMemberPos() {
        for (var i = 1; i <= GroupsConst.MAX_PLAYER_SIZE; i++) {
            var memberNode = this._memberLoction2Data[i].node;
            var touchBeginPos = this._memberLoction2Data[i].pos;
            if (memberNode) {
                memberNode.setPosition(touchBeginPos);
                memberNode.zIndex = (i * 10);
            }
        }
    }

    private _addTouchEvent() {
        this._panel.on(cc.Node.EventType.TOUCH_START, handler(this, this._onTouchStart));
        this._panel.on(cc.Node.EventType.TOUCH_MOVE, handler(this, this._onTouchMove));
        this._panel.on(cc.Node.EventType.TOUCH_END, handler(this, this._onTouchEnd));
        this._panel.on(cc.Node.EventType.TOUCH_CANCEL, handler(this, this._onTouchEnd));
    }

    private _removeTouchEvent() {
        this._panel.off(cc.Node.EventType.TOUCH_START, handler(this, this._onTouchStart));
        this._panel.off(cc.Node.EventType.TOUCH_MOVE, handler(this, this._onTouchMove));
        this._panel.off(cc.Node.EventType.TOUCH_END, handler(this, this._onTouchEnd));
        this._panel.off(cc.Node.EventType.TOUCH_CANCEL, handler(this, this._onTouchEnd));
    }

    private _onTouchStart(sender: cc.Touch) {
        var index = this._checkIsSelectedMember(sender);
        if (index) {
            this._isTouch = true;
            this._originalPos = index;
            var node = this._memberLoction2Data[index].node;
            var touchBeginPos = this._panel.convertToNodeSpaceAR(sender.getStartLocation());
            node.setPosition(touchBeginPos);
            var selectedMemberPos = cc.v2(node.getPosition());
            this._distanceX = selectedMemberPos.x - touchBeginPos.x;
            this._distanceY = selectedMemberPos.y - touchBeginPos.y;
            this._onMemberSelected(node);
            this._checkMoveHit(touchBeginPos);
            return true;
        }
        this._isTouch = false;
        return false;
    }

    private _onTouchMove(sender: cc.Touch) {
        if (this._isTouch) {
            var movePos = sender.getLocation();
            var localMovePos = this._panel.convertToNodeSpaceAR(movePos);
            var spinePosX = localMovePos.x + this._distanceX;
            var spinePosY = localMovePos.y + this._distanceY;
            this._curSelectedMemberNode.setPosition(spinePosX, spinePosY);
            this._checkMoveHit(localMovePos);
        }
    }

    private _onTouchEnd() {
        if (this._isTouch) {
            this._isTouch = false;
            this._onMemberUnselected();
        }
    }

    private _onKickUserSuccess() {
        this._updateData();
        this._updateView();
    }

    private _onTransferLeaderSuccess() {
        this._updateData();
        this._updateView();
    }

    private _onApplyListUpdate() {
        this._checkApplyRedPoint();
    }

    private _onApplyTimeOut() {
        this._checkApplyRedPoint();
    }

    private _onOpApproveChange() {
        this._checkApplyRedPoint();
    }

    private _checkApplyRedPoint() {
        if (this._isSelfLeader) {
            var applyListCount = this._myMemberData.getApplyListCount();
            this._btnApply.showRedPoint(applyListCount > 0);
        }
    }

    private _onChangeLocation() {
        this._updateData();
        this._updateHeros();
    }

    private _onSetChangeSuccess() {
        this._updateData();
        this._updateAuto();
    }

    public onBtnAdd() {
        this._addMenuRoot.active = (!this._addMenuRoot.active);
    }

    public onBtnApply() {
        G_SceneManager.openPopup(Path.getPrefab("PopupGroupsApplyView", "groups"));
    }

    public onBtnGo() {
        var groupType = this._memberData.getTeam_type();
        G_UserData.getGroups().c2sTeamEnterScene(groupType);
    }

    public onBtnOut() {
        GroupsViewHelper.quitGroupTip();
    }

    public onBtnWorld() {
        var memberData = this._memberData;
        if (memberData.isFull()) {
            G_Prompt.showTip(Lang.get('groups_tips_18'));
            this._addMenuRoot.active = (!this._addMenuRoot.active);
            return;
        }
        var teamType = GroupsDataHelper.getGroupTypeWithTarget(memberData.getTeam_target());
        var isSuccess = G_UserData.getChat().sendCreateTeamMsg(ChatConst.CHANNEL_WORLD, memberData.getTeam_id(), teamType, memberData.getUserCount(), GroupsConst.MAX_PLAYER_SIZE, false);
        this._addMenuRoot.active = (!this._addMenuRoot.active);
        if (isSuccess) {
            G_Prompt.showTip(Lang.get('groups_tips_17'));
        }
    }

    public onBtnGuild() {
        var memberData = this._memberData;
        if (memberData.isFull()) {
            G_Prompt.showTip(Lang.get('groups_tips_18'));
            this._addMenuRoot.active = (!this._addMenuRoot.active);
            return;
        }
        var teamType = GroupsDataHelper.getGroupTypeWithTarget(memberData.getTeam_target());
        var isSuccess = G_UserData.getChat().sendCreateTeamMsg(ChatConst.CHANNEL_GUILD, memberData.getTeam_id(), teamType, memberData.getUserCount(), GroupsConst.MAX_PLAYER_SIZE, false);
        this._addMenuRoot.active = (!this._addMenuRoot.active);
        if (isSuccess) {
            G_Prompt.showTip(Lang.get('groups_tips_17'));
        }
    }

    public onBtnLock() {
        this._isLock = !this._isLock;
        this._updateLock();
    }

    private _onClickCheckBox(isCheck) {
        if (this._myMemberData) {
            var memberData = this._myMemberData.getGroupData();
            var teamTarget = memberData.getTeam_target();
            var minLevel = memberData.getMin_level();
            var maxLevel = memberData.getMax_level();
            G_UserData.getGroups().c2sChangeTeamSet(teamTarget, minLevel, maxLevel, isCheck);
        }
    }
}