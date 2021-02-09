const {ccclass, property} = cc._decorator;

import CommonShopItemCell from '../../../ui/component/CommonShopItemCell'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { handler } from '../../../utils/handler';

@ccclass
export default class ShopViewItemCell extends ListViewCellBase {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: CommonShopItemCell,
       visible: true
   })
   _itemInfo1: CommonShopItemCell = null;

   @property({
       type: CommonShopItemCell,
       visible: true
   })
   _itemInfo2: CommonShopItemCell = null;

    _init(id){
        this.setIdx(id);
    }

    onInit() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateUI(index, itemLine:any[], tabIndex) {
        this.node.name = ('ShopViewItemCell' + (index + 1));
        for (var i = 1; i<=2; i++) {
            var item = this['_itemInfo' + i];
            if (item) {
                item.setVisible(false);
            }
        }
        for (var i=1; i<=itemLine.length;i++) {
            var item = itemLine[i-1];
            var itemInfo = this['_itemInfo' + i] as CommonShopItemCell;
            if (itemInfo) {
                itemInfo.updateUI(item,false,null);
                itemInfo.setVisible(true);
                itemInfo.setItemID(i + index * 2);
                itemInfo.setCallBack(handler(this, this._onBtnClick));
            }
        }
    }
    _onBtnClick(iconNameNode:CommonShopItemCell) {
        //dump(iconNameNode);
        var curSelectedPos = iconNameNode.getItemID();
        //logWarn(' ShopViewItemCell:_onBtnClick  ' + curSelectedPos);
        this.dispatchCustomCallback(curSelectedPos);
    }
    findItemByPos(pos) {
        for (var i = 1; i<=2; i++) {
            var itemInfo = this['_itemInfo' + i];
            if (itemInfo && itemInfo.getTag() == pos) {
                return itemInfo;
            }
        }
        return null;
    }

}
