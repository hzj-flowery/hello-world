const { ccclass, property } = cc._decorator;

import CommonNormalSmallPop from '../../../ui/component/CommonNormalSmallPop'
import CommonHeroIcon from '../../../ui/component/CommonHeroIcon';
import CommonHeadFrame from '../../../ui/component/CommonHeadFrame';
import PopupBase from '../../../ui/PopupBase';
import { handler } from '../../../utils/handler';
import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal';
import { Lang } from '../../../lang/Lang';
import { G_SignalManager, G_ServerTime, G_UserData, Colors } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { GroupsDataHelper } from '../../../utils/data/GroupsDataHelper';
import { GroupsConst } from '../../../const/GroupsConst';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class PopupGroupsAgreementView extends PopupBase {

    @property({ type: CommonNormalSmallPop, visible: true })
    _panelBg: CommonNormalSmallPop = null;

    @property({ type: cc.Label, visible: true })
    _txtNum: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _nodeTime: cc.Node = null;

    @property({ type: CommonHeroIcon, visible: true })
    _fileNodeIcon3: CommonHeroIcon = null;

    @property({ type: CommonHeadFrame, visible: true })
    _commonHeadFrame3: CommonHeadFrame = null;

    @property({ type: CommonHeroIcon, visible: true })
    _fileNodeIcon2: CommonHeroIcon = null;

    @property({ type: CommonHeadFrame, visible: true })
    _commonHeadFrame2: CommonHeadFrame = null;

    @property({ type: CommonHeroIcon, visible: true })
    _fileNodeIcon1: CommonHeroIcon = null;

    @property({ type: CommonHeadFrame, visible: true })
    _commonHeadFrame1: CommonHeadFrame = null;

    @property({ type: cc.Sprite, visible: true })
    _imgProgress: cc.Sprite = null;

    @property({ type: cc.ProgressBar, visible: true })
    _loadingBar: cc.ProgressBar = null;

    @property({ type: CommonButtonLevel0Normal, visible: true })
    _btnOk: CommonButtonLevel0Normal = null;

    private _data;
    private _configInfo;
    private _refreshTime;
    private _countDownHandler;

    private _signalUpdateEnterSceneState;
    private _signalOpEnterScene;

    public onCreate() {
        this._initData();
        this._initView();
    }

    private _initData() {
        this._data = null;
        this._configInfo = null;
        this._refreshTime = 0;
        this._countDownHandler = null;
    }

    private _initView() {
        this._panelBg.addCloseEventListener(handler(this, this._onCloseClick));
        this._panelBg.setCloseVisible(true);
        this._panelBg.setTitle('');
        this._btnOk.setString(Lang.get('groups_prepare'));
        this._btnOk.setVisible(false);
        this._imgProgress.node.active = (false);
    }

    public onEnter() {
        this._signalUpdateEnterSceneState = G_SignalManager.add(SignalConst.EVENT_GROUP_UPDATE_ENTER_SCENE_STATE, handler(this, this._onUpdateEnterSceneState));
        this._signalOpEnterScene = G_SignalManager.add(SignalConst.EVENT_GROUP_OP_ENTER_SCENE, handler(this, this._onOpEnterScene));
        this._updateData();
        this._startCountDown();
        this._updateView();
    }

    public onExit() {
        this._stopCountDown();
        this._signalUpdateEnterSceneState.remove();
        this._signalUpdateEnterSceneState = null;
        this._signalOpEnterScene.remove();
        this._signalOpEnterScene = null;
    }

    private _startCountDown() {
        this._stopCountDown();
        this.schedule(handler(this, this._onCountDown), 1);
        this._onCountDown();
    }

    private _stopCountDown() {
        if (this._countDownHandler) {
            this.unschedule(this._countDownHandler);
            this._countDownHandler = null;
        }
    }

    private _onCountDown() {
        var agreeTime = this._data.getAgreeTime();
        var leftTime = G_ServerTime.getLeftSeconds(agreeTime);
        if (leftTime >= 0) {
            this._nodeTime.removeAllChildren();
            var richText = RichTextExtend.createWithContent(Lang.get('groups_agreement_time', { second: leftTime }));
            richText.node.setAnchorPoint(0, 0.5);
            this._nodeTime.addChild(richText.node);
            var percent = leftTime / this._configInfo.agree_activity_time;
            this._loadingBar.progress = (percent);
        } else {
            this._stopCountDown();
            this.close();
        }
    }

    private _updateData() {
        this._data = G_UserData.getGroups().getMyGroupData().getPreSceneInfo();
        var teamTarget = this._data.getTeam_target();
        this._configInfo = GroupsDataHelper.getTeamTargetConfig(teamTarget);
    }

    private _updateView() {
        this._panelBg.setTitle(Lang.get('qin_title'));
        this._updateAgreeCount();
        this._updateIcons();
    }

    private _updateAgreeCount() {
        var currentNum = this._data.getAgreeCount();
        var totalNum = this._data.getMemberCount();
        this._txtNum.string = (Lang.get('groups_agreement_num', {
            current: currentNum,
            total: totalNum
        }));
    }

    private _checkIsAllAgree() {
        var currentNum = this._data.getAgreeCount();
        var totalNum = this._data.getMemberCount();
        if (currentNum >= totalNum) {
            return true;
        } else {
            return false;
        }
    }

    private _updateIcons() {
        var playerId = G_UserData.getBase().getId();
        let fileNodeIcons: CommonHeroIcon[] = [this._fileNodeIcon1, this._fileNodeIcon2, this._fileNodeIcon3];
        let commonHeadFrames: CommonHeadFrame[] = [this._commonHeadFrame1, this._commonHeadFrame2, this._commonHeadFrame3];
        for (let i = 0; i < GroupsConst.MAX_PLAYER_SIZE; i++) {
            var icon = fileNodeIcons[i];
            var frameNode = commonHeadFrames[i];
            var userData = this._data.getUserDataWithLocation(i + 1);
            var ImgMask = icon.node.getChildByName('ImgMask');
            var TextName = icon.node.getChildByName('TextName').getComponent(cc.Label);
            if (userData) {
                icon.updateUI(userData.getCovertId(), null, userData.getLimitLevel());
                frameNode.updateUI(userData.getHead_frame_id(), icon.node.scale)
                frameNode.setLevel(userData.getLevel());
                icon.showHeroUnknow(false);
                TextName.string = (userData.getName());
                TextName.node.color = (Colors.getOfficialColor(userData.getOffice_level()));
                UIHelper.updateTextOfficialOutline(TextName.node, userData.getOffice_level());
                var isConfirm = userData.isConfirmEnterScene();
                ImgMask.active = (!isConfirm);
                frameNode.setSelected(isConfirm);
                if (userData.getUser_id() == playerId && isConfirm) {
                    this._btnOk.setVisible(false);
                    this._imgProgress.node.active = (true);
                }
                if (userData.getUser_id() == playerId && !isConfirm) {
                    this._imgProgress.node.active = (false);
                    this._btnOk.setVisible(true);
                }
            } else {
                TextName.string = ('');
                ImgMask.active = (true);
                frameNode.setSelected(false);
                icon.showHeroUnknow(true);
            }
        }
    }

    private _onUpdateEnterSceneState(event) {
        this._updateData();
        this._updateAgreeCount();
        this._updateIcons();
        var isAllAgree = this._checkIsAllAgree();
        if (isAllAgree) {
            this.close();
        }
    }

    private _onOpEnterScene(event, state) {
        if (state == GroupsConst.NO) {
            this.close();
        }
    }

    private _onCloseClick() {
        this.close();
    }

    public onBtnOk() {
        G_UserData.getGroups().c2sOpEnterScene(GroupsConst.OK);
    }
}