import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import { Colors } from "../../init";
import CommonUI from "./CommonUI";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonResourceInfoList extends cc.Component {

   @property({
       type: cc.Label,
       visible: true
   })
   _text: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image: cc.Sprite = null;

   setVisible(visible){
       this.node.active = visible;
   }
   isVisible(){
       return this.node.active;
   }
    updateUI(type, value, size) {
        type = type || TypeConvertHelper.TYPE_RESOURCE;
        var itemParams = TypeConvertHelper.convert(type, value);
        if (itemParams.res_mini) {
            UIHelper.loadTexture(this._image,itemParams.res_mini); 
        }
        if (size!=null) {
            this.setCount(size);
        }
    }
    setCount(count) {
        if (count != null) {
            this._text.string = ('' + count);
        }
    }
    setGray() {
        // var ShaderHelper = require('ShaderHelper');
        // ShaderHelper.filterNode(this._imageRes, 'gray');
        // this._textCount.setColor(Colors.BUTTON_ONE_DISABLE);
    }
    resetFromGray() {
        // var ShaderHelper = require('ShaderHelper');
        // ShaderHelper.filterNode(this._imageRes, '', true);
        // this.setTextColorToATypeColor();
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
    setCountColorToWhite() {
        this._text.node.color = (Colors.CLASS_WHITE);
    }
    setFontSize(fontSize) {
        this._text.fontSize = (fontSize);
    }
}
