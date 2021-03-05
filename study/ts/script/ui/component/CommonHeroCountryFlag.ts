import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import CommonUI from "./CommonUI";
import { Path } from "../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonHeroCountryFlag extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageColor: cc.Sprite = null;

    updateUI(type, value, limitLevel, limitRedLevel): void {
        var param = TypeConvertHelper.convert(type, value, null, limitLevel, limitRedLevel);
        if (param && param.color) {
            this.node.active = true;
            var color = param.color;
            this._imageColor.addComponent(CommonUI).loadTexture(Path.getBackground('img_light_0' + color, '.png'));
        }else {
            this.node.active = false;
        }
    }

}