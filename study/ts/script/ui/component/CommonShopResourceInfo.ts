import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonShopResourceInfo extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_bk: cc.Sprite = null;

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

   @property({
       type: cc.Button,
       visible: true
   })
   _button_add: cc.Button = null;

   private _callBack:any;

    updateUI(type, value, size) {
        type = type || TypeConvertHelper.TYPE_RESOURCE;
        var itemParams = TypeConvertHelper.convert(type, value);
        if (itemParams.res_mini) {
            UIHelper.loadTexture(this._image,itemParams.res_mini);
        }
        if (size) {
            this.setCount(size);
        }
    }
    setCount(count) {
        if (typeof(count) == 'number') {
            this._text.string = ('' + count);
        }
    }
    addClickEventListenerEx(callback) {
        this._callBack = callback;
        UIHelper.addEventListener(this.node,this._button_add,'CommonShopResourceInfo','onBtnAddClick');
        //UIHelper.addEventListener(this.node,this._button_add,'CommonShopResourceInfo','onBtnAddClick');
    }
    onBtnAddClick(){
        if(this._callBack){
            this._callBack();
        }
    }

}
