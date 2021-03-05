import { Path } from "../../../utils/Path";
import { G_EffectGfxMgr } from "../../../init";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CakeNode extends cc.Component {
    _target: cc.Node;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageShow: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    private _curLevel:number;
    ctor() {
        this._curLevel = 0;
    }
    updateUI(info) {
        if (info.lv != this._curLevel) {
            var movingName = info.cake_pic_effect;
            this._nodeEffect.removeAllChildren();
            G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, movingName, null, null, false);
            this._curLevel = info.lv;
        }
    }

}