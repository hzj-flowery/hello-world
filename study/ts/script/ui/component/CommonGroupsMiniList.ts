import { Lang } from "../../lang/Lang";
import { G_SignalManager, G_UserData, G_SceneManager } from "../../init";
import { SignalConst } from "../../const/SignalConst";
import { handler } from "../../utils/handler";
import CommonGroupsMiniListCell from "./CommonGroupsMiniListCell";
import { Path } from "../../utils/Path";
import PopupAlert from "../PopupAlert";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonGroupsMiniList extends cc.Component {

    @property({ type: cc.Sprite, visible: true })
    _imageBg: cc.Sprite = null;
    @property({ type: cc.Node, visible: true })
    _listView: cc.Node = null;
    @property({ type: cc.Button, visible: true })
    _buttonArrow: cc.Button = null;
    @property({ type: cc.Button, visible: true })
    _buttonGroup: cc.Button = null;
    @property({ type: cc.Sprite, visible: true })
    _imageArrow: cc.Sprite = null;
    @property({ type: cc.Label, visible: true })
    _textAwardTips: cc.Label = null;

    @property({ type: cc.Prefab, visible: true })
    _miniListCellPrefab: cc.Prefab = null;

    private _initPosX;
    private _initPosY;
    private _moveDistance;
    private _isOpen = true;
    private _userList = {};

    private _signalMyGroupUpdate;
    private _signalTransferLeader;
    private _signalKickUser;
    private _signalChangeLocation;

    public onEnable() {
        this._textAwardTips.string = (Lang.get('groups_tips_32'));
        this._initPosX = this.node.x;
        this._initPosY = this.node.y;
        this._moveDistance = this._imageBg.node.getContentSize().width;
        this._signalMyGroupUpdate = G_SignalManager.add(SignalConst.EVENT_GROUP_MY_GROUP_INFO_UPDATE, handler(this, this._onMyGroupUpdate));
        this._signalTransferLeader = G_SignalManager.add(SignalConst.EVENT_GROUP_TRANSFER_LEADER_SUCCESS, handler(this, this._onTransferLeaderSuccess));
        this._signalKickUser = G_SignalManager.add(SignalConst.EVENT_GROUP_MY_GROUP_KICK_USER, handler(this, this._onKickUserSuccess));
        this._signalChangeLocation = G_SignalManager.add(SignalConst.EVENT_GROUP_CHANGE_LOCATION_SUCCESS, handler(this, this._onChangeLocation));
        this._updateData();
        this._updateView();
    }

    public onDisable() {
        this._signalMyGroupUpdate.remove();
        this._signalMyGroupUpdate = null;
        this._signalTransferLeader.remove();
        this._signalTransferLeader = null;
        this._signalKickUser.remove();
        this._signalKickUser = null;
        this._signalChangeLocation.remove();
        this._signalChangeLocation = null;
    }

    private _updateData() {
        this._userList = {};
        var myGroupData = G_UserData.getGroups().getMyGroupData();
        if (myGroupData) {
            this._userList = myGroupData.getGroupData().getUserList();
        }
    }

    private _updateView() {
        this._listView.removeAllChildren();
        for (var i = 1; i <= 3; i++) {
            var userData = this._userList[i];
            var cell = cc.instantiate(this._miniListCellPrefab).getComponent(CommonGroupsMiniListCell);
            cell.init(handler(this, this._onClickCallback));
            cell.updateUI(userData, i);
            this._listView.addChild(cell.node);
        }
        this._updateAwardTip();
    }

    private _updateAwardTip() {
        var myGroupData = G_UserData.getGroups().getMyGroupData();
        if (myGroupData) {
            if (myGroupData.isAwardAdd()) {
                this._textAwardTips.node.color = (cc.color(60, 255, 0));
                this._imageArrow.node.active = (true);
            } else {
                this._textAwardTips.node.color = (cc.color(125, 125, 125));
                this._imageArrow.node.active = (false);
            }
        }
    }

    private _onClickCallback(userData) {
        if (userData) {
            this.doPopupGroup();
        } else {
            G_SceneManager.openPopup(Path.getPrefab("PopupGroupsInviteView", "groups"));
        }
    }

    public doPopupGroup() {
        G_SceneManager.openPopup(Path.getPrefab("PopupGroupsView", "groups"));
    }

    public onClickBtnArrow() {
        if (this._isOpen) {
            this._moveIn();
        } else {
            this._moveOut();
        }
    }

    private _moveOut() {
        if (this._imageBg.node.getActionByTag(456)) {
            return;
        }
        var moveBy = cc.moveBy(0.5, cc.v2(this._moveDistance, 0));
        var seq = cc.sequence(moveBy, cc.callFunc(function () {
            this._isOpen = true;
            this._buttonArrow.node.angle = 0;
        }.bind(this)));
        seq.setTag(456);
        this._imageBg.node.runAction(seq);
    }

    private _moveIn() {
        if (this._imageBg.node.getActionByTag(123)) {
            return;
        }
        var moveBy = cc.moveBy(0.5, cc.v2(-this._moveDistance, 0));
        var seq = cc.sequence(moveBy, cc.callFunc(function () {
            this._isOpen = false;
            this._buttonArrow.node.angle = -180;
        }.bind(this)));
        seq.setTag(123);
        this._imageBg.node.runAction(seq);
    }

    private _onMyGroupUpdate() {
        var myGroupData = G_UserData.getGroups().getMyGroupData();
        if (myGroupData == null) {
            var callback = function () {
                G_SceneManager.popScene();
            };
            G_SceneManager.openPopup(Path.getCommonPrefab("PopupAlert"), (popup: PopupAlert) => {
                popup.init(null, Lang.get('groups_not_connect_out_active_tip'), callback, callback);
                popup.onlyShowOkButton();
                popup.openWithAction();
            })
            return;
        }
        this._updateData();
        this._updateView();
    }

    private _onTransferLeaderSuccess() {
        this._updateData();
        this._updateView();
    }

    private _onKickUserSuccess() {
        this._updateData();
        this._updateView();
    }

    private _onChangeLocation() {
        this._updateData();
        this._updateView();
    }
}