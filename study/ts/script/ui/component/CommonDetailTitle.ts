import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonDetailTitle extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBase: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle: cc.Label = null;

    onLoad() {
        this.setFontSize(this._textTitle.fontSize);
    }

    setTitleAndAdjustBgSize(title) {
        this._textTitle.string = (title);
        var size = this._textTitle.node.getContentSize();
        var imageBaseSize = this._imageBase.node.getContentSize();
        this._imageBase.node.setContentSize(cc.size(size.width + 110, imageBaseSize.height));
    }
    setTitle(title) {
        this._textTitle.string = (title);
    }
    setTitleColor(color: cc.Color) {
        this._textTitle.node.color = (color);
    }
    setTitleOutLine(color) {
        UIHelper.enableOutline(this._textTitle, color, 2)
    }
    setFontSize(size) {
        if (typeof (this._textTitle.fontSize) == "number")
            this._textTitle.fontSize = (size - 2);
    }
    setFontName(fontName) {
        return;
        this._textTitle.font = (fontName);
    }
    setFontImageBgSize(size) {
        this._imageBase.node.setContentSize(size);
    }
    setImageBaseSize(size) {
        this._imageBase.node.setContentSize(size);
    }
    showTextBg(bShow) {
        this._imageBase.node.active = (bShow);
    }

}