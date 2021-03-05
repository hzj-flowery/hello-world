import { HomelandConst } from "../../../const/HomelandConst";
import { G_EffectGfxMgr, G_UserData } from "../../../init";
import { SpineNode } from "../../../ui/node/SpineNode";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { HomelandHelp } from "./HomelandHelp";
import PopupHomelandMainUp from "./PopupHomelandMainUp";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HomelandMainNode extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAvatar: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _redPoint: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelContainer: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _harvestNode: cc.Node = null;
    _homelandType: any;
    _data: any;
    _spine: SpineNode;
    _timeScheduler: boolean = false;
    _schedualFunc: Function;


    ctor(homelandType, data?) {
        this._homelandType = homelandType;
        this._data = data;

    }
    onCreate() {
        if (this.isFriendTree() == false) {
        }
    }
    createSpineData() {
        var config = this._data.treeCfg;
        var spineNode = this._nodeAvatar.getChildByName('spineNode');
        if (spineNode == null) {
            this._spine = SpineNode.create();
            spineNode = this._spine.node;
            this._spine.setAsset(Path.getEffectSpine(config.spine_res));
            spineNode.name = ('spineNode');
            this._nodeAvatar.addChild(spineNode);
        }
    }

    hideSpineNode() {
        var spineNode = this._nodeAvatar.getChildByName('spineNode');
        if (spineNode != null) {
            spineNode.active = (false);
        }
    }
    createMovingNode(movingName) {
        function effectFunction(effect) {
            return new cc.Node();
        }
        function eventFunction(event) {
            if (event == 'finish') {
            } else if (event == 'play') {
            }
        }
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeAvatar, movingName, effectFunction, eventFunction, false).node;
        effect.name = ('movingNode');
    }
    hideMovingNode() {
        var movingNode = this._nodeAvatar.getChildByName('movingNode');
        if (movingNode != null) {
            movingNode.removeFromParent();
        }
    }

    updateUI(data) {
        this._data = data;

        var config = this._data.treeCfg;
        var movingName = config.moving_name;
        if (movingName != null && movingName != '') {
            this.hideMovingNode();
            this.hideSpineNode();
            this.createMovingNode(movingName);
        } else {
            this.hideMovingNode();
            this.createSpineData();
            var spineNode = this._nodeAvatar.getChildByName('spineNode');
            spineNode.active = (true);
            this._spine.setAnimation(config.animation_name, true);
        }

        HomelandHelp.updateNodeTreeTitle(this.node, this._data);
        this.node.setPosition(cc.v2(config.spine_x, config.spine_y));
        this._panelContainer.setPosition(cc.v2(config.click_x, config.click_y));
        var Node_treeTitle = this.node.getChildByName('Node_treeTitle');
        Node_treeTitle.setPosition(cc.v2(config.title_x, config.title_y));
        this._panelContainer.setContentSize(cc.size(config.width, config.height));
        this.node.zIndex = (config.order);
        this._harvestNode.setPosition(cc.v2(config.icon_x, config.icon_y));
        this.updateRedPoint();
        this.playLoopEffect();
    }
    _startCountDown() {
        if (this._timeScheduler == false && this.isFriendTree() == false) {
            this._schedualFunc = handler(this, this._updateCountDown);
            this.schedule(this._schedualFunc, 0.8);
            this._timeScheduler = true;
            this._updateCountDown();
        }
    }
    _updateCountDown(dt?) {
    }
    updateRedPoint() {
        if (this.isFriendTree() == false) {
            var showRedPoint1 = !G_UserData.getHomeland().isTreeAwardTake();
            var showRedPoint2 = HomelandHelp.checkMainTreeUp(this._data, false);
            this._redPoint.node.active = (showRedPoint1 || showRedPoint2);
        } else {
            this._redPoint.node.active = (false);
        }
    }
    _stopCountDown() {
        if (this._timeScheduler && this.isFriendTree() == false) {
            this.unschedule(this._schedualFunc);
            this._timeScheduler = false;
        }
    }
    onEnter() {
    }
    onExit() {
    }
    isFriendTree() {
        if (this._homelandType == HomelandConst.FRIEND_TREE) {
            return true;
        }
        return false;
    }
    onBtnAdd() {
        PopupHomelandMainUp.getIns(PopupHomelandMainUp, function (p: PopupHomelandMainUp) {
            p.ctor(this._data, this.isFriendTree());
            p.openWithAction();
        }.bind(this))
        //   var PopupHomelandMainUp = require('PopupHomelandMainUp');
        // if (this.isFriendTree()) {
        //     var popUpDlg = new PopupHomelandMainUp();
        //     popUpDlg.openWithAction();
        // } else {
        //     var popUpDlg = new PopupHomelandMainUp(this._data, this.isFriendTree());
        //     popUpDlg.openWithAction();
        // }
    }
    playLvUpEffect(finishCall) {
        function eventFunction(event) {
            if (event == 'finish' && finishCall) {
                finishCall();
            }
        }
        G_EffectGfxMgr.createPlayGfx(this._nodeAvatar, this._data.treeCfg.up_effect, eventFunction, true);
    }
    playLoopEffect() {
        this._nodeEffect.removeAllChildren();
        if (this._data.treeCfg.up_loop_effect && this._data.treeCfg.up_loop_effect != '') {
            G_EffectGfxMgr.createPlayGfx(this._nodeEffect, this._data.treeCfg.up_loop_effect);
        }
    }
}