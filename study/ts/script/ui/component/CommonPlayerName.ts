import { Colors, G_UserData } from "../../init";
import UIHelper from "../../utils/UIHelper";
import CommonUI from "./CommonUI";
import { Path } from "../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonPlayerName extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_title: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPlayerName: cc.Label = null;

    updateUI(name, rankLevel) {
        if (rankLevel == null) {
            rankLevel = 0;
        }
        this._textPlayerName.string = (name);
        this._textPlayerName.node.color = (Colors.getOfficialColor(rankLevel));
        UIHelper.updateTextOfficialOutline(this._textPlayerName.node, rankLevel);
        var officialInfo = G_UserData.getBase().getOfficialInfo(rankLevel)[0];
        this._image_title.sizeMode = cc.Sprite.SizeMode.RAW;
        if (rankLevel == 0) {
            this._image_title.node.addComponent(CommonUI).loadTexture(Path.getTextHero('guanxianming_1'))
        } else {
            this._image_title.node.addComponent(CommonUI).loadTexture(Path.getTextHero(officialInfo.picture));
            this._image_title.node.active = true;
        }
    }
    updateNameGap(gap?) {
        gap = gap || 0;
        var size = this._image_title.node.getContentSize();
        if (size && size.width > 0) {
            this._textPlayerName.node.x = (size.width + 10 + gap);
        }
    }
    disableOutline() {
        this._textPlayerName.node.removeComponent(cc.LabelOutline)
    }
    setFontSize(size) {
        this._textPlayerName.fontSize = (size);
    }
    getWidth() {
        return this._textPlayerName.node.getContentSize().width + this._textPlayerName.node.x;
    }


}