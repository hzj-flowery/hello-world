import { CakeActivityConst } from "../../../const/CakeActivityConst";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { G_EffectGfxMgr } from "../../../init";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CakeAwardBox extends cc.Component {
    public static readonly RES_INFO = {
        [CakeActivityConst.AWARD_STATE_1]: { image: 'baoxiangjin_guan' },
        [CakeActivityConst.AWARD_STATE_2]: {
            image: 'baoxiangjin_kai',
            effect: 'effect_dangao_boxjump'
        },
        [CakeActivityConst.AWARD_STATE_3]: { image: 'baoxiangjin_kong' }
    };
    _target: cc.Node;
    _callback: any;
    _state: number;
    _awardId: number;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageIcon: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    ctor(target, callback) {
        this._target = target;
        this._callback = callback;
        this._state = 0;
        this._awardId = 0;
        // this._panelTouch.addClickEventListenerEx(handler(this, this._onClick));
    }
    updateUI(state, awardId) {
        this._state = state;
        this._awardId = awardId;
        var resName = CakeAwardBox.RES_INFO[state].image;
        UIHelper.loadTexture(this._imageIcon, Path.getChapterBox(resName));
        this._imageIcon.node.active = (true);
        var effectName = CakeAwardBox.RES_INFO[state].effect;
        this._nodeEffect.removeAllChildren();
        if (effectName) {
            this._imageIcon.node.active = (false);
            G_EffectGfxMgr.createPlayGfx(this._nodeEffect, effectName);
        }
    }
    onClick() {
        if (this._callback) {
            this._callback(this._state, this._awardId);
        }
    }
}