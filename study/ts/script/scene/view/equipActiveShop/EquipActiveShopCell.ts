const {ccclass, property} = cc._decorator;

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'

import CommonResourceInfoList from '../../../ui/component/CommonResourceInfoList'

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import { G_UserData } from '../../../init';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { ShopActiveDataHelper } from '../../../utils/data/ShopActiveDataHelper';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import ListViewCellBase from '../../../ui/ListViewCellBase';

@ccclass
export default class EquipActiveShopCell extends ListViewCellBase {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _item1: cc.Node = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _icon1: CommonIconTemplate = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textName1: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeFragment1: cc.Node = null;

   @property({
       type: CommonResourceInfoList,
       visible: true
   })
   _cost1_1: CommonResourceInfoList = null;

   @property({
       type: CommonResourceInfoList,
       visible: true
   })
   _cost1_2: CommonResourceInfoList = null;

   @property({
       type: CommonButtonLevel1Highlight,
       visible: true
   })
   _button1: CommonButtonLevel1Highlight = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDes1: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageDiscount1: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _item2: cc.Node = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _icon2: CommonIconTemplate = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textName2: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeFragment2: cc.Node = null;

   @property({
       type: CommonResourceInfoList,
       visible: true
   })
   _cost2_1: CommonResourceInfoList = null;

   @property({
       type: CommonResourceInfoList,
       visible: true
   })
   _cost2_2: CommonResourceInfoList = null;

   @property({
       type: CommonButtonLevel1Highlight,
       visible: true
   })
   _button2: CommonButtonLevel1Highlight = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDes2: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageDiscount2: cc.Sprite = null;

//    ctor() {
//     var resource = {
//         file: Path.getCSB('EquipActiveShopCell', 'equipActiveShop'),
//         binding: {
//             _button1: {
//                 events: [{
//                         event: 'touch',
//                         method: '_onClickButton1'
//                     }]
//             }
//             _button2: {
//                 events: [{
//                         event: 'touch',
//                         method: '_onClickButton2'
//                     }]
//             }
//         }
//     };
// }
onCreate() {
    var size = this._resourceNode.getContentSize();
    this.node.setContentSize(size.width, size.height);
    this._button1.addClickEventListenerEx(handler(this,this._onClickButton1));
    this._button2.addClickEventListenerEx(handler(this,this._onClickButton2));
}
protected updateUI(index,data){
    this.updateData(data[0],data[1]);
}
private updateData(goodId1, goodId2) {
    var updateNode = function (index, goodId) {
        if (goodId) {
            (this['_item' + index] as cc.Node).active = (true);
            var data = G_UserData.getShopActive().getUnitDataWithId(goodId);
            var info = data.getConfig();
            var param = TypeConvertHelper.convert(info.type, info.value);
            var costInfo = ShopActiveDataHelper.getCostInfo(goodId);
            var isBought = data.isBought();
            var strButton = isBought && Lang.get('shop_btn_buyed') || Lang.get('shop_btn_buy');
            (this['_icon' + index] as CommonIconTemplate).unInitUI();
            (this['_icon' + index] as CommonIconTemplate).initUI(info.type, info.value, info.size);
            (this['_icon' + index] as CommonIconTemplate).setTouchEnabled(true);
            (this['_textName' + index] as cc.Label).string = (param.name);
            (this['_textName' + index] as cc.Label).node.color = (param.icon_color);
            for (var i = 1; i <= 2; i++) {
                var cost = costInfo[i-1];
                if (cost) {
                    (this['_cost' + (index + ('_' + i))] as CommonResourceInfoList).setVisible(true);
                    (this['_cost' + (index + ('_' + i))] as CommonResourceInfoList).updateUI(cost.type, cost.value, cost.size);
                } else {
                    (this['_cost' + (index + ('_' + i))] as CommonResourceInfoList).setVisible(false);
                }
            }
            (this['_button' + index] as CommonButtonLevel1Highlight).setString(strButton);
            (this['_button' + index] as CommonButtonLevel1Highlight).setEnabled(!isBought);
        } else {
            (this['_item' + index] as cc.Node).active = (false);
        }
    }.bind(this)
    updateNode(1, goodId1);
    updateNode(2, goodId2);
}
_onClickButton1() {
    this.dispatchCustomCallback(1);
}
_onClickButton2() {
    this.dispatchCustomCallback(2);
}


}