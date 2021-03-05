import PopupBase from "../../../ui/PopupBase";
import { G_AudioManager, G_EffectGfxMgr } from "../../../init";
import { AudioConst } from "../../../const/AudioConst";
import { PopupGetRewards } from "../../../ui/PopupGetRewards";
import { handler } from "../../../utils/handler";

var EFFECT_OPEN_STONE = {
    [701]: 'moving_shuijingbaozha_qinglong',
    [702]: 'moving_shuijingbaozha_xuanwu',
    [703]: 'moving_shuijingbaozha_baihu',
    [704]: 'moving_shuijingbaozha_zhuque',
    [721]: "moving_shuijingbaozha_zhulong",
    [722]: "moving_shuijingbaozha_jingwei"
};
var SOUND_OPEN_STONE = {
    [701]: AudioConst.SOUND_JADE_OPEN1,
    [702]: AudioConst.SOUND_JADE_OPEN2,
    [703]: AudioConst.SOUND_JADE_OPEN3,
    [704]: AudioConst.SOUND_JADE_OPEN4,
    [721]: AudioConst.SOUND_JADE_OPEN5,
    [722]: AudioConst.SOUND_JADE_OPEN6,
};

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupObtainJadeStone extends PopupBase {
    public static path = 'common/PopupObtainJadeStone';
    _itemId: any;
    _awards: any;

    @property({
        type: cc.Node,
        visible: true
    })
    _effectNode: cc.Node = null;

    ctor(itemId, awards) {
        this._itemId = itemId;
        this._awards = awards;
        this.node.name = ('PopupObtainJadeStone');
    }
    onCreate() {
    }
    _onPanelTouch() {
    }
    onEnter() {
        G_AudioManager.playSoundWithId(SOUND_OPEN_STONE[this._itemId]);
        this._playEffect();
    }
    onExit() {
    }
    _playEffect() {
        var eventHandler = function (event) {
            if (event == 'get') {
                PopupGetRewards.showRewards(this._awards, handler(this, this.close));
            }
        }.bind(this);
        G_EffectGfxMgr.createPlayMovingGfx(this._effectNode, EFFECT_OPEN_STONE[this._itemId], null, eventHandler);
    }
}