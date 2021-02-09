import ViewBase from "../../ViewBase";
import { G_EffectGfxMgr } from "../../../init";
import EffectGfxNode from "../../../effect/EffectGfxNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildWarAttackNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeSword: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;
    _cityId: any;
    _config: any;
    _listener: any;
    _swordEffect;

    initData(cityId, config) {
        this._cityId = cityId;
        this._config = config;
        this._listener = null;
    }
    onCreate() {
        this.showSword(true);
    }
    onEnter() {
    }
    onExit() {
    }
    _createSwordEft() {
        var effectFunction = function (effect) {
        }.bind(this);
        this._swordEffect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeSword, 'moving_shuangjian', effectFunction, null, false);
        this._swordEffect.setPosition(0, 0);
        this._swordEffect.setAnchorPoint(cc.v2(0.5, 0.5));
    }
    showSword(s) {
        if (!this._swordEffect) {
            this._createSwordEft();
        }
        this._swordEffect.setVisible(s);
    }
    _onPointClick(sender, state) {
        if (this._listener) {
            this._listener(this._cityId, this._config.point_id);
        }
    }
    setOnPointClickListener(listener) {
        this._listener = listener;
    }

}