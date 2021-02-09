import { G_SceneManager, G_ServerTime, G_TopLevelNode } from "../init";
import { Lang } from "../lang/Lang";
import ViewBase from "../scene/ViewBase";
import { handler } from "../utils/handler";
import UIHelper from "../utils/UIHelper";
import CommonButton from "./component/CommonButton";
import CommonButtonCountDown from "./component/CommonButtonCountDown";
import CommonHeadFrame from "./component/CommonHeadFrame";
import CommonHeroIcon from "./component/CommonHeroIcon";

const { ccclass, property } = cc._decorator;
@ccclass
export default class GroupsTipBar extends ViewBase {

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
        this._rootY =  66;
        this._panelRoot.y = (this._rootY);
    }
    onEnter() {
    }
    onExit() {
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
    slideOut(data, filterViewNames) {
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
        var posX = sceneSize.width/2 - noteSize.width;
        var posY = this._rootY;
        var callAction = cc.callFunc(function () {
        });
        var action = cc.moveTo(0.3, cc.v2(posX, posY));
        var runningAction = cc.sequence(action, callAction);
        this._panelRoot.runAction(runningAction);
    }
    closeWindow() {
        var sceneSize = this.getSceneSize();
        var posX = sceneSize.width/2 + 10;
        var callAction = cc.callFunc(function () {
            this.node.destroy();
        }.bind(this));
        var action = cc.moveBy(0.3, cc.v2(posX, 0));
        var runningAction = cc.sequence(action, callAction);
        this._panelRoot.runAction(runningAction);
    }
    onBtnCancel() {
    }
    onBtnOk() {
    }
    onCheckBoxClicked() {
    }
}