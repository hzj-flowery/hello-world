import { G_EffectGfxMgr } from "../../init";
import { SilkbagDataHelper } from "../../utils/data/SilkbagDataHelper";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";



const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonSilkbagAvatar extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectDown: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMidBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageIcon: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectUp: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image11: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;
    _callback: any;
    _effect1: any;
    _effect2: any;

    onLoad() {
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "CommonSilkbagAvatar";// 这个是代码文件名
        clickEventHandler.handler = "_onTouchCallBack";
        var btn = this._panelTouch.getComponent(cc.Button) || this._panelTouch.addComponent(cc.Button);
        btn.clickEvents.push(clickEventHandler);
    }
    updateUI(baseId) {
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, baseId);
        UIHelper.loadTexture(this._imageMidBg, param.icon_mid_bg2);
        UIHelper.loadTexture(this._imageIcon, param.icon);
        this._textName.string = (param.name);
        this._textName.node.color = (param.icon_color);
        this.showIconEffect(baseId);
    }
    setCallBack(callback) {
        if (this._callback) {
            this._callback = null;
        }
        this._callback = callback;
    }
    _onTouchCallBack(sender, state) {
        if (this._callback) {
            this._callback();
        }
    }
    removeLightEffect() {
        if (this._effect1) {
            this._effect1.node.runAction(cc.destroySelf);
            this._effect1 = null;
        }
        if (this._effect2) {
            this._effect2.node.runAction(cc.destroySelf);
            this._effect2 = null;
        }
    }
    showIconEffect(baseId) {
        this.removeLightEffect();
        var effects = SilkbagDataHelper.getEffectWithBaseId(baseId);
        if (effects == null) {
            return;
        }
        if (effects.length == 1) {
            var effectName = effects[0];
            this._effect1 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectUp, effectName);
        }
        if (effects.length == 2) {
            var effectName1 = effects[0];
            this._effect1 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectUp, effectName1);
            var effectName2 = effects[1];
            this._effect2 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectUp, effectName2);
        }
    }

}