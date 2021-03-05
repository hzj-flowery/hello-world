import { TypeConvertHelper } from "../../utils/TypeConvertHelper";

import { Path } from "../../utils/Path";

import { Colors } from "../../init";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonPetVName extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_color: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_Name: cc.Label = null;

    updateUI(petBaseId) {
        var params = TypeConvertHelper.convert(TypeConvertHelper.TYPE_PET, petBaseId);
        var color = params.cfg.color;
       UIHelper.loadTexture( this._image_color, Path.getPet('img_shenshou_color' + color));
        this._text_Name.string = (params.name);
        this._text_Name.node.color = (Colors.getPetColor(color));
    }
    disableOutline() {
       UIHelper.disableOutline(this._text_Name);
    }
    setFontSize(size) {
        this._text_Name.fontSize = (size);
    }

    setVisible(v) {
        this.node.active = v;
    }
}