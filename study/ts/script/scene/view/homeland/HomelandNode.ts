import { HomelandConst } from "../../../const/HomelandConst";
import { G_EffectGfxMgr } from "../../../init";
import { SpineNode } from "../../../ui/node/SpineNode";
import { Path } from "../../../utils/Path";
import { HomelandHelp } from "./HomelandHelp";
import PopupHomelandSubUp from "./PopupHomelandSubUp";




const { ccclass, property } = cc._decorator;

@ccclass
export default class HomelandNode extends cc.Component {

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
    _homelandType: any;
    _data: any;

    _spine: SpineNode;

    ctor(homelandType, data?) {
        this._homelandType = homelandType;
        this._data = data;
    }
    onCreate() {
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
    
    getTreeCfg() {
        return this._data.treeCfg;
    }
    updateUI(data) {
        this._data = data;
        var config = this._data.treeCfg;

        this.createSpineData();
        this._spine.setAnimation(config.animation_name, true);

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
        this._nodeAvatar.active = (true);
        this._panelContainer.active = (true);
        if (config.type == HomelandConst.MAX_SUB_TREE_TYPE6) {
            if (this._data.treeLevel == 0) {
                this._nodeAvatar.active = (false);
                this._panelContainer.active = (false);
            }
        }
        this.updateRedPoint();
        this.playLoopEffect();
    }
    onEnter() {
    }
    onExit() {
    }
    isSubTreeOpen() {
        return this._data.treeLevel > 0;
    }
    onBtnAdd() {
        if (this._data.treeLevel == 0) {
            return;
        }
        PopupHomelandSubUp.getIns(PopupHomelandSubUp, function (p: PopupHomelandSubUp) {
            p.ctor(this._data, this.isFriendTree());
            p.openWithAction();
        }.bind(this))
        // if (this.isFriendTree()) {
        //     var PopupHomelandSubUp = require('PopupHomelandSubUp');
        //     var popUpDlg = new PopupHomelandSubUp(this._data, this.isFriendTree());
        //     popUpDlg.openWithAction();
        // } else {
        //     var PopupHomelandSubUp = require('PopupHomelandSubUp');
        //     var popUpDlg = new PopupHomelandSubUp(this._data, this.isFriendTree());
        //     popUpDlg.openWithAction();
        // }
    }
    updateRedPoint() {
        if (this.isFriendTree() == false) {
            var showRedPoint = HomelandHelp.checkSubTreeUp(this._data, false);
            this._redPoint.node.active = (showRedPoint);
        } else {
            this._redPoint.node.active = (false);
        }
    }
    isFriendTree() {
        if (this._homelandType == HomelandConst.FRIEND_TREE) {
            return true;
        }
        return false;
    }
    playLvUpEffect(finishCall) {
        if (finishCall) {
            finishCall();
        }
        function eventFunction(event) {
            if (event == 'finish') {
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
    playOpenEffect(finishCall) {
        if (finishCall) {
            finishCall();
        }
        function eventFunction(event) {
            if (event == 'finish') {
            }
        }
        G_EffectGfxMgr.createPlayGfx(this._nodeAvatar, this._data.treeCfg.open_effect, eventFunction, true);
    }
}