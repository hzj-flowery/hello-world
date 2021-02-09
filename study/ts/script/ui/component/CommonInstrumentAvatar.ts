import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonInstrumentAvatar extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageShadow: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageInstrument: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_click: cc.Node = null;
    _callback: any;


    updateUI(baseId, limitLevel?) {
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId, null, null, limitLevel);
        //this._imageInstrument.loadTexture(param.icon_big);

        UIHelper.loadTexture(this._imageInstrument, param.icon_big);

        // cc.resources.load(param.icon_big, () => {
        //     this._imageInstrument.spriteFrame = new cc.SpriteFrame(param.icon_big);
        // });
    }
    showShadow(visible) {
        this._imageShadow.node.active = visible;
    }

    setTouchEnabled(enable) {
        // this._panel_click.setTouchEnabled(enable);
        // this._panel_click.setSwallowTouches(false);
    }
    setCallBack(callback) {
        if (this._callback) {
            this._callback = null;
        }
        this._callback = callback;
    }

    onTouchCallBack(sender) {
        if (this._callback) {
            this._callback();
        }
    }

}
