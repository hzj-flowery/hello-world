import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import CommonUI from "./CommonUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonHeroCountry extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCountry: cc.Sprite = null;

    updateUI(heroBaseId: number) {
        var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
        var countryText = heroParam.country_text;
        if (countryText) {
            this._imageCountry.addComponent(CommonUI).loadTexture(countryText);
            this._imageCountry.node.active = true;
        } else {
            this._imageCountry.node.active = (false);
        }
    }

}