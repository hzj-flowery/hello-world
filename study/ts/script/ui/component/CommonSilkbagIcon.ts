import { SignalConst } from "../../const/SignalConst";
import EffectGfxNode from "../../effect/EffectGfxNode";
import { G_EffectGfxMgr, G_SignalManager } from "../../init";
import PopupSilkbagDetailEx from "../../scene/view/silkbag/PopupSilkbagDetailEx";
//import EffectGfxNode from "../../effect/EffectGfxNode";
import { SilkbagDataHelper } from "../../utils/data/SilkbagDataHelper";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import CommonIconBase from "./CommonIconBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonSilkbagIcon extends CommonIconBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectDown: cc.Node = null;


    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMidBg: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectUp: cc.Node = null;
    _effect1: EffectGfxNode;
    _effect2: EffectGfxNode;

    constructor() {
        super();
        this._type = TypeConvertHelper.TYPE_SILKBAG;
    }

    onLoad() {
        super.onLoad();
        this._imageMidBg = this._imageMidBg || this.node.getChildByName('ImageMidBg').getComponent(cc.Sprite);
    }


    updateUI(value, size?) {
        var itemParams = super.updateUI(value, size);
        UIHelper.loadTexture(this._imageMidBg, itemParams.icon_mid_bg);
        if (itemParams.size != null) {
            this.setCount(itemParams.size);
        }
        this.showIconEffect();
        return itemParams;
    }
    _onTouchCallBack(sender, state) {
        if (this._callback) {
            this._callback(sender, this._itemParams);
        } else {
            PopupSilkbagDetailEx.getIns(PopupSilkbagDetailEx, (p: PopupSilkbagDetailEx) => {
                p.ctor(TypeConvertHelper.TYPE_SILKBAG, this._itemParams.cfg.id);
                p.openWithAction();
                // if (G_UserData.getSeasonSport().getInSeasonSilkView()) {
                //     p.updateInSeasonSilkView();
                //     p.setCloseCallBack(handler(this, this._dispatchSeasonSilk));
                // }
            })

        }
    }
    _dispatchSeasonSilk() {
        G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_CLOSESILKDETAIL);
    }
    removeLightEffect() {
        if (this._effect1) {
            this._effect1.node.runAction(cc.destroySelf());
            this._effect1 = null;
        }
        if (this._effect1) {
            this._effect2.node.runAction(cc.destroySelf());
            this._effect2 = null;
        }
    }
    showIconEffect(scale?) {
        this.removeLightEffect();
        if (this._itemParams == null) {
            return;
        }
        var baseId = this._itemParams.cfg.id;
        var effects = SilkbagDataHelper.getEffectWithBaseId(baseId);
        if (effects == null) {
            return;
        }
        if (this._nodeEffectUp == null) {
            this._nodeEffectUp = this.node.getChildByName('NodeEffectUp');
        }
        if (this._nodeEffectDown == null) {
            this._nodeEffectDown = this.node.getChildByName('NodeEffectDown');
        }
        if (effects.length == 1) {
            var effectName = effects[0];
            this._effect1 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectUp, effectName);
            // this._effect1 = new EffectGfxNode(effectName);
            // this._nodeEffectUp.addChild(this._effect1);
            // this._effect1.play();
        }
        if (effects.length == 2) {
            var effectName1 = effects[0];
            this._effect1 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectUp, effectName1);
            // this._effect1 = new EffectGfxNode(effectName1);
            // this._nodeEffectDown.addChild(this._effect1);
            // this._effect1.play();
            var effectName2 = effects[1];
            this._effect2 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectUp, effectName2);
            // this._effect2 = new EffectGfxNode(effectName2);
            // this._nodeEffectUp.addChild(this._effect2);
            // this._effect2.play();
        }
    }

}