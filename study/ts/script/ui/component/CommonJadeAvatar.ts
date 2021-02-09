import { TypeConvertHelper } from "../../utils/TypeConvertHelper";

import { G_EffectGfxMgr, G_ConfigLoader } from "../../init";
import UIHelper from "../../utils/UIHelper";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { stringUtil } from "../../utils/StringUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonJadeAvatar extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _effectDown: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageJade: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _effectUp: cc.Node = null;
    _callback: any;
    _userData: any;

    onLoad() {
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "CommonJadeAvatar";// 这个是代码文件名
        clickEventHandler.handler = "onTouchCallBack";
        var button = this._panelTouch.addComponent(cc.Button);
        button.clickEvents.push(clickEventHandler);

        this._imageJade.sizeMode = cc.Sprite.SizeMode.RAW;

    }

    updateUI(jadeSysId, hideEffect?) {
        var equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_JADE_STONE, jadeSysId);
        UIHelper.loadTexture(this._imageJade, equipParam.icon_big);
        this._effectUp.removeAllChildren();
        this._effectDown.removeAllChildren();
        if (!hideEffect) {
            this._showAvatarEffect(jadeSysId);
        }
    }
    setCallBack(callback) {
        if (this._callback) {
            this._callback = null;
        }
        this._callback = callback;
    }
    _showAvatarEffect(jadeSysId) {
        var config = G_ConfigLoader.getConfig(ConfigNameConst.JADE).get(jadeSysId);
        if (config) {
            var xxeffects = stringUtil.split(config.effect, '|');
            if (xxeffects[0] != 'null') {
                G_EffectGfxMgr.createPlayGfx(this._effectUp, xxeffects[0]);
            }
            if (xxeffects[1] != 'null') {
                G_EffectGfxMgr.createPlayGfx(this._effectDown, xxeffects[1]);
            }
        }
    }
    onTouchCallBack(sender, state) {
        if (this._callback) {
            this._callback(this._userData);
        }
    }
    getHeight() {
        return this._imageJade.node.getContentSize().height;
    }

}