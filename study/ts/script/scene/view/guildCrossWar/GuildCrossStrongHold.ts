import ViewBase from "../../ViewBase";
import { GuildCrossWarHelper } from "./GuildCrossWarHelper";
import { G_EffectGfxMgr } from "../../../init";
const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildCrossStrongHold extends ViewBase {
    _pointId: any;

    @property({
        type: cc.Node,
        visible: true
    })
    _resourcePanel: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _attackPanel: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageHold: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCd: cc.Label = null;
    _effectNode:any;

    initData(pointId) {
        this._pointId = pointId;
    }
    onCreate() {
        this._initView();
        this._initPosition();
    }
    onEnter() {
    }
    onExit() {
    }
    _initView() {
        var size = this._resourcePanel.getContentSize();
        this.node.setContentSize(size.width, size.height);
        // this._resourcePanel.setSwallowTouches(false);
        // this._imageHold.setSwallowTouches(false);
        // this._attackPanel.setSwallowTouches(false);
        this._imageHold.node.active = (false);
        this._attackPanel.setScale(0.7);
        this._effectNode = G_EffectGfxMgr.createPlayMovingGfx(this._attackPanel, 'moving_juntuanzhan_jiantou', null, null, false);
    }
    _initPosition() {
        var itemData = GuildCrossWarHelper.getWarCfg(this._pointId);
        if (itemData == null) {
            return;
        }
        var postion = GuildCrossWarHelper.convertToSmallMapPos(cc.v2(itemData.map_x * 0.75, itemData.map_y * 0.75));
        this.node.setPosition(postion);
    }
    updateHold(isHold) {
        this._imageHold.node.active = (isHold);
    }
    updateAttack(isAttack, leftSecond) {
        leftSecond = leftSecond || 0;
        this._effectNode.node.active = (false);
        this._textCd.node.active = (false);
    }
}