import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonTreasureName extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_1: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    setName(treasureId, rank?, formatName?) {
        var treasureParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, treasureId);
        var treasureName = treasureParam.name;
        if (rank && rank > 0) {
            treasureName = treasureName + ('+' + rank);
        }
        this._textName.string = (treasureName);
        this._textName.node.color = (treasureParam.icon_color);
        UIHelper.updateTextOutline(this._textName, treasureParam);
        if (formatName) {
            this._resetTextAreaSize();
        }
    }
    _resetTextAreaSize() {
        //var renderSize = this._textName.getVirtualRendererSize();
        var renderSize = this._textName.node.getContentSize();

        var fontSize = this._textName.fontSize;
        var maxWidth = fontSize * 6;
        var lineHeight = fontSize + 4;
        if (renderSize.width > maxWidth || renderSize.height > lineHeight) {
            //this._textName.setTextAreaSize(cc.size(maxWidth + 3, lineHeight * 2));
            this._textName.node.position.y = (-lineHeight / 2 - 2);
        } else {
            //this._textName.setTextAreaSize(cc.size(maxWidth + 3, lineHeight));
            this._textName.node.position.y = (-2);
        }
        //this._textName.ignoreContentAdaptWithSize(false);
    }
    setFontSize(size) {
        this._textName.fontSize = (size);
    }
    disableOutline() {
        this._textName.node.removeComponent(cc.LabelOutline);
    }
    showTextBg(bShow) {
        this._image_1.node.active = (bShow);
    }

}