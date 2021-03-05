import UIHelper from "../../utils/UIHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonGoldenHeroName extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_3: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_1: cc.Label = null;

    setName(heroName) {
        this._text_1.string = (heroName);
    }
    setColor(color) {
        this._text_1.node.color = (color);
    }
    setCountryFlag(path) {
        UIHelper.loadTexture(this._image_3, path);
    }
    setNamePositionY(posY) {
        this._text_1.node. y = (posY);
    }
    setCountryScaleY(value) {
        this._image_1.node.scaleY = (value);
    }

}
