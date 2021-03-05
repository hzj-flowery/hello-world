import GroupsTipBar from "../../../ui/GroupsTipBar";
import { G_SignalManager, G_SceneManager, G_UserData, G_TopLevelNode, G_ServerTime } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { CountryBossConst } from "../../../const/CountryBossConst";
import { CountryBossHelper } from "../countryboss/CountryBossHelper";
import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import CommonHeadFrame from "../../../ui/component/CommonHeadFrame";
import CommonButtonCountDown from "../../../ui/component/CommonButtonCountDown";
import CommonButton from "../../../ui/component/CommonButton";
import ViewBase from "../../ViewBase";
import UIHelper from "../../../utils/UIHelper";
import { Lang } from "../../../lang/Lang";


const { ccclass, property } = cc._decorator;
@ccclass
export default class GuildPushTeamApply extends ViewBase {
    _userData: any;
    _signalDataClear: any;
    _signalClearNotice: any;


    setParam(userData) {
        this._userData = userData;
    }
    slideOut(data, filterViewNames) {
        if (G_SceneManager.getRunningSceneName() == 'countrybossbigboss' || G_SceneManager.getRunningSceneName() == 'countrybosssmallboss' || G_SceneManager.getRunningSceneName() == 'countryboss') {
            if (CountryBossConst.NOTOPEN != CountryBossHelper.getStage()) {
                return;
            }
        }
        if (G_SceneManager.getRunningSceneName() == 'worldBoss') {
            if (G_UserData.getWorldBoss().isBossStart()[0]) {
                return;
            }
        }
        this.slideOut1(data, filterViewNames);
    }
    _updateTips() {
        var isTip = G_UserData.getGuild().isTipInvite();
        var isSelected = !isTip;
        if (isSelected) {
        }
        else {
            this._checkBoxTip.uncheck();
        }
        // this._checkBoxTip.setSelected(isSelected);
    }
    _onDataClear(event) {
        this.node.removeFromParent();
    }
    onBtnCancel() {
        this._userData._endCountDown();
        G_UserData.getGuild().c2sConfirmGuildTrain(this._userData.getUser_id(), false);
        this.closeWindow();
    }
    onBtnOk() {
        G_UserData.getGuild().c2sConfirmGuildTrain(this._userData.getUser_id(), true);
        this._userData._endCountDown();
        this.closeWindow();
    }
    onCheckBoxClicked() {
        var isTip = G_UserData.getGuild().isTipInvite();
        G_UserData.getGuild().setTipInvite(!isTip);
        this._updateTips();
    }
    _onEventClearInviteNotice(event) {
        this.node.removeFromParent();
    }


    @property({ type: cc.Node, visible: true })
    _panelRoot: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imageBg: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageInvite: cc.Sprite = null;

    @property({ type: CommonHeroIcon, visible: true })
    _icon: CommonHeroIcon = null;

    @property({ type: CommonHeadFrame, visible: true })
    _headFrame: CommonHeadFrame = null;

    @property({ type: cc.Label, visible: true })
    _leaderName: cc.Label = null;

    @property({ type: CommonButtonCountDown, visible: true })
    _btnCancel: CommonButtonCountDown = null;

    @property({ type: CommonButton, visible: true })
    _btnOk: CommonButton = null;

    @property({ type: cc.Label, visible: true })
    _targetName: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _imageTips: cc.Sprite = null;

    @property({ type: cc.Toggle, visible: true })
    _checkBoxTip: cc.Toggle = null;

    _rootY: number;
    _rootX: any;
    onCreate() {
        this.setSceneSize();
        this._rootY = 0;
        this._btnCancel.setString(Lang.get('groups_refuse'));
        this._btnOk.setString(Lang.get('groups_accept'));
        var sceneSize = this.getSceneSize();
        var noteSize = this._panelRoot.getContentSize();
        this._rootX = this._panelRoot.x;
        // this._rootY = sceneSize.height - noteSize.height - 66;
        this._rootY = 66;
        this._panelRoot.y = (this._rootY);
    }
    onEnter() {
        this._signalDataClear = G_SignalManager.add(SignalConst.EVENT_TRAIN_DATA_CLEAR, handler(this, this._onDataClear));
        this._signalClearNotice = G_SignalManager.add(SignalConst.EVENT_CLEAR_GUILD_INVITE_NOTICE, handler(this, this._onEventClearInviteNotice));
        this._updateTips();
    }
    onExit() {
        this._signalDataClear.remove();
        this._signalDataClear = null;
        this._signalClearNotice.remove();
        this._signalClearNotice = null;
    }
    _checkFilter(filterNames) {
        filterNames = filterNames || {};
        var runningScene = G_SceneManager.getRunningScene();
        var sceneName = runningScene.getName();
        for (var i in filterNames) {
            var filterName = filterNames[i];
            if (sceneName == filterName) {
                return true;
            }
        }
        return false;
    }
    slideOut1(data, filterViewNames) {
        if (this._checkFilter(filterViewNames)) {
            return;
        }
        G_TopLevelNode.addToGroupNoticeLayer(this.node);
        this._updateUI(data);
        this._moveOut();
    }
    _updateUI(data) {
        var show = data.showImageTips || false;
        this._imageTips.node.active = (show);
        if (data.imageRes) {
            UIHelper.loadTexture(this._imageInvite, data.imageRes);
        }
        if (data.name) {
            this._leaderName.string = (data.name);
        }
        if (data.nameColor) {
            this._leaderName.node.color = (data.nameColor);
        }
        if (data.targetName) {
            this._targetName.string = (data.targetName);
        }
        if (data.covertId) {
            this._icon.updateUI(data.covertId, null, data.limitLevel);
        }
        if (data.headFrameId) {
            this._headFrame.updateUI(data.headFrameId, this._icon.node.scale);
        }
        if (data.level) {
            this._headFrame.setLevel(data.level);
        }
        if (data.endTime) {
            this._btnCancel.startCountDown(data.endTime, handler(this, this._countDownEnd), handler(this, this._countDownFormatStr));
        }
        if (data.imageBg) {
            UIHelper.loadTexture(this._imageBg, data.imageBg);
        }
    }
    _countDownEnd() {
        this.closeWindow();
    }
    _countDownFormatStr(endTime) {
        var time = G_ServerTime.getLeftSeconds(endTime);
        var str = '';
        if (time < 10) {
            str = ' ';
        }
        str = str + (time + 's');
        return str;
    }
    _moveOut() {
        var sceneSize = this.getSceneSize();
        var noteSize = this._panelRoot.getContentSize();
        var posX = sceneSize.width / 2 - noteSize.width;
        var posY = this._rootY;
        var callAction = cc.callFunc(function () {
        });
        var action = cc.moveTo(0.3, cc.v2(posX, posY));
        var runningAction = cc.sequence(action, callAction);
        this._panelRoot.runAction(runningAction);
    }
    closeWindow() {
        var sceneSize = this.getSceneSize();
        var posX = sceneSize.width / 2 + 10;
        var callAction = cc.callFunc(function () {
            this.node.removeFromParent();
        }.bind(this));
        var action = cc.moveBy(0.3, cc.v2(posX, 0));
        var runningAction = cc.sequence(action, callAction);
        this._panelRoot.runAction(runningAction);
    }
}