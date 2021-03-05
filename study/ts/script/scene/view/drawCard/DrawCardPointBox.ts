import { G_EffectGfxMgr } from "../../../init";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DrawCardPointBox extends cc.Component {
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBox: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRing: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _redPoint: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPoint: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectA: cc.Node = null;

    _touchFunc: any;
    _imageOpen: any;
    _imageNormal: any;
    _imageEmpty: any;
    _point: any;
    _state: any;
    public static readonly STATE_NORMAL = 1;
    public static readonly STATE_OPEN = 2;
    public static readonly STATE_EMPTY = 3;


    onLoad() {
        this._imageBox.enabled = true;

        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "DrawCardPointBox";// 这个是代码文件名
        clickEventHandler.handler = "_onBoxClick";
        var button = this._imageBox.getComponent(cc.Button) || this._imageBox.addComponent(cc.Button);
        button.clickEvents.push(clickEventHandler);
    }
    addTouchFunc(func: Function) {
        this._touchFunc = func;
    }
    setParam(param: any) {
        this._imageNormal = param.imageClose;
        this._imageOpen = param.imageOpen;
        this._imageEmpty = param.imageEmpty;
        this._point = param.point;
        this._textPoint.string = (this._point);
        UIHelper.loadTexture(this._imageBox.getComponent(cc.Sprite), this._imageNormal);
    }
    _onBoxClick() {
        if (this._touchFunc) {
            this._touchFunc(this);
        }
    }
    setBoxState(state) {
        this.showRedPoint(false);
        // this._imageBox.node.ignoreContentAdaptWithSize(true);
        if (state == DrawCardPointBox.STATE_NORMAL) {
            UIHelper.loadTexture(this._imageBox.getComponent(cc.Sprite), this._imageNormal);
        }
        else if (state == DrawCardPointBox.STATE_OPEN) {
            UIHelper.loadTexture(this._imageBox.getComponent(cc.Sprite), this._imageOpen);
            this.showRedPoint(true)
        }
        else if (state == DrawCardPointBox.STATE_EMPTY) {
            UIHelper.loadTexture(this._imageBox.getComponent(cc.Sprite), this._imageEmpty);
        }
        this._state = state;
    }
    getBoxPoint() {
        return this._point;
    }
    setRingImage(image) {
        UIHelper.loadTexture(this._imageRing.getComponent(cc.Sprite), image);
    }
    getState() {
        return this._state;
    }
    showRedPoint(s: boolean) {
        this._redPoint.node.active = s;
        if (s == true) {
            this._playEffectGfx();
        } else {
            this._stopEffectGfx();
        }
    }
    _stopEffectGfx() {
        this._nodeEffectA.removeAllChildren();
    }
    _playEffectGfx() {
        this._stopEffectGfx();
        G_EffectGfxMgr.createPlayGfx(this._nodeEffectA, 'effect_zhaomu_baoxiang');
    }
}