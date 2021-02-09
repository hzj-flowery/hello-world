import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import CommonUI from "../../../ui/component/CommonUI";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DrawCardResourceInfo extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRes: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text: cc.Label = null;

    _target: any;
    _itemParams: any;
    public static readonly SINGLE_POSX = 108;
    public static readonly OTHER_POSX = 90;

    onLoad() {

    }

    updateUI(type: number, value: number, size: any) {
        type = type || TypeConvertHelper.TYPE_RESOURCE;
        var itemParams = TypeConvertHelper.convert(type, value);
        this._itemParams = itemParams;
        if (itemParams.res_mini) {
            this._imageRes.node.addComponent(CommonUI).loadTexture(itemParams.res_mini);
        }
        if (size) {
            if (size <= 10) {
                this.node.x = (DrawCardResourceInfo.SINGLE_POSX - 97);
            } else {
                this.node.x = (DrawCardResourceInfo.OTHER_POSX - 97);
            }
            this._text.string = size;
        }
    }
    setVisible(v: boolean) {
        this._target.setVisible(v);
    }
}