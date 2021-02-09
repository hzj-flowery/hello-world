import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";
import { G_EffectGfxMgr } from "../../init";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonBox extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBox: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _touchPanel: cc.Node = null;

    private _picNormal;
    private _picEmpty;
    private _picOpen;
    private _effect;
    private _hasEffect;
    private _nowState;

    public addClickEventListenerEx(callback) {
        this._touchPanel.on(cc.Node.EventType.TOUCH_START, callback);
    }

    public setParams(params) {
        this._picNormal = params.picNormal || Path.getChapterBox('img_mapbox_guan');
        this._picEmpty = params.picEmpty || Path.getChapterBox('img_mapbox_kong');
        this._picOpen = params.picOpen || Path.getChapterBox('img_mapbox_kai');
        this._effect = params.effect || 'effect_boxflash_xingxing';
        if (params.effect) {
            this._hasEffect = true;
        }
    }

    public setState(state) {
        if (this._nowState == state) {
            return;
        }
        this._nowState = state;
        this._nodeEffect.active = false;
        this._imageBox.node.active = false;
        if (state == 'normal') {
            this._imageBox.node.active = true;
            UIHelper.loadTexture(this._imageBox, this._picNormal);
        } else if (state == 'open') {
            this._nodeEffect.active = true;
            this._nodeEffect.removeAllChildren();
            G_EffectGfxMgr.createPlayGfx(this._nodeEffect, this._effect);
            this._imageBox.node.active = true;
            UIHelper.loadTexture(this._imageBox, this._picOpen);
        } else if (state == 'empty') {
            this._imageBox.node.active = true;
            UIHelper.loadTexture(this._imageBox, this._picEmpty);
        }
    }

    public playBoxJump() {
        this._nodeEffect.removeAllChildren();
        this._imageBox.node.active = false;
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_boxjump', null, null, false);
    }
}