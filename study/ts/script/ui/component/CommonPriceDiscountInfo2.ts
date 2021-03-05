import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import PopupBase from "../PopupBase";
import { Lang } from "../../lang/Lang";
import PopupItemGuider from "../PopupItemGuider";
import { Colors } from "../../init";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonPriceDiscountInfo2 extends cc.Component {

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
       type: cc.Label,
       visible: true
   })
   _text_title: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_line: cc.Sprite = null;


   _itemParams: any;


   updateUI(type, value, size) {
       type = type || TypeConvertHelper.TYPE_RESOURCE;
       var itemParams = TypeConvertHelper.convert(type, value);
       this._itemParams = itemParams;
       if (itemParams.res_mini) {
           UIHelper.loadTexture(this._image, itemParams.res_mini);
       }
       if (size) {
           this.setCount(size);
       }
   }

   setCount(count, max?) {
       if (count != null) {
           this._text.string = ('' + count);
       }
   }
   _onShowResWay(sender) {
       var type = this._itemParams.item_type;
       var id = this._itemParams.cfg.id;
       PopupBase.loadCommonPrefab('PopupItemGuider',(popup:PopupItemGuider)=>{
           popup.setTitle(Lang.get('way_type_get'));
           popup.updateUI(type, id);
           popup.openWithAction();
       });

   }
   setCountColorRed(needRed) {
       if (needRed == null) {
           needRed = false;
       }
       if (needRed == true) {
           this._text.node.color = (Colors.uiColors.RED);
       } else {
           this._text.node.color = (Colors.COLOR_POPUP_DESC_NOTE);
       }
   }
   setCountColorBeige() {
       this._text.node.color = (Colors.uiColors.BEIGE);
   }
   setCountUnknown() {
       this._text.string = ('???');
   }
   setTextColor(c3b) {
       this._text.node.color = (c3b);
   }
   showDiscountLine(show) {
       this._image_line.node.active = (show);
   }   

}
