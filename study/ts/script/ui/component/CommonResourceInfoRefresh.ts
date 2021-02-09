import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import { Colors } from "../../init";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonResourceInfoRefresh extends cc.Component {

   @property({
       type: cc.Label,
       visible: true
   })
   _textResName: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text: cc.Label = null;

    _init() {

    }
    bind(target) {

        this._init();
    }
    unbind(target) {

    }
    alignToRight(imgOffset, nameOffset) {
        var countX = this._text.node.x;
        (this._text as any)._updateRenderData(true);
        var textSize = this._text.node.getContentSize();
        var imgSize = this._image.node.getContentSize();
        imgSize.width = imgSize.width * this._image.node.scaleX;
        this._image.node.x = (countX - textSize.width + imgOffset);
        this._textResName.node.x = (countX - textSize.width + imgOffset - imgSize.width + nameOffset);
    }
    alignToRightForRandomShop() {
        this.alignToRight(-6.3, -7.1);
    }
    showResName(show, name) {
        if (show) {
            this._textResName.node.active = (true);
            this._textResName.string = (name);
        } else {
            this._textResName.node.active = (false);
        }
    }
    updateUI(type, value, size?) {
        type = type || TypeConvertHelper.TYPE_RESOURCE;
        var itemParams = TypeConvertHelper.convert(type, value);
        if (itemParams.res_mini) {
            UIHelper.loadTextureFromAtlas(this._image,itemParams.res_mini);
        }
        if (size) {
            this.setCount(size);
        }
    }
    setCount(count) {
        if (count != null) {
            this._text.string = ('' + count);
        }
    }
    setTextColorToRed() {
        this._text.node.color = (Colors.DARK_BG_RED);
    }
    setTextColorToATypeColor() {
        this._text.node.color = (Colors.BRIGHT_BG_ONE);
    }
    setTextColorToBTypeColor() {
        this._text.node.color = (Colors.LIST_TEXT);
    }
    setTextColorToDTypeColor() {
        this._text.node.color = (Colors.BRIGHT_BG_ONE);
    }
    setCountColorToBtnLevel1Bright() {
        this._text.node.color = (Colors.BUTTON_ONE_NOTE);
    }
    setFontSize(fontSize) {
        this._text.fontSize = (fontSize);
    }

}
