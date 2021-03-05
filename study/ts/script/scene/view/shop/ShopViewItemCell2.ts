const {ccclass, property} = cc._decorator;

import CommonShopItemCell2 from '../../../ui/component/CommonShopItemCell2'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { handler } from '../../../utils/handler';

@ccclass
export default class ShopViewItemCell2 extends ListViewCellBase {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: CommonShopItemCell2,
       visible: true
   })
   _itemInfo1: CommonShopItemCell2 = null;

   @property({
       type: CommonShopItemCell2,
       visible: true
   })
   _itemInfo2: CommonShopItemCell2 = null;

   @property({
       type: CommonShopItemCell2,
       visible: true
   })
   _itemInfo3: CommonShopItemCell2 = null;

   @property({
       type: CommonShopItemCell2,
       visible: true
   })
   _itemInfo4: CommonShopItemCell2 = null;

   private TOTAL_COUNT:number = 4;

   private BACKGROUND_NORMAL:number = 0;
   private BACKGROUND_START:number = 1;
   private BACKGROUND_END:number = 2;

    _init(id){
        this.setIdx(id);
    }

    onInit() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateUI(index, itemLine:any[], tabIndex) {
        this.node.name = ('ShopViewItemCell2' + (index + 1));
        for (var i = 1; i<=this.TOTAL_COUNT; i++) {
            var item = this['_itemInfo' + i] as CommonShopItemCell2;
            if (item) {
                item.node.active = (false);
            }
        }
        for (var i=1; i<=itemLine.length;i++) {
            var item1 = itemLine[i-1];
            var itemInfo = this['_itemInfo' + i] as CommonShopItemCell2;
            if (itemInfo) {
                var bgStatus = this.BACKGROUND_NORMAL;
                if (i == 1) {
                    bgStatus = this.BACKGROUND_START;
                }
                if (i == this.TOTAL_COUNT) {
                    bgStatus = this.BACKGROUND_END;
                }
                itemInfo.updateUI(item1, false,tabIndex);
                itemInfo.node.active = (true);
                itemInfo.updateBackgroundImge(bgStatus);
                itemInfo.setItemID(i + index * this.TOTAL_COUNT);
                itemInfo.setCallBack(handler(this, this._onBtnClick));
            }
        }
    }
    _onBtnClick(iconNameNode:CommonShopItemCell2) {
        //dump(iconNameNode);
        var curSelectedPos = iconNameNode.getItemID();
        //logWarn(' ShopViewItemCell2:_onBtnClick  ' + curSelectedPos);
        this.dispatchCustomCallback(curSelectedPos);
    }
    findItemByPos(pos) {
        for (var i = 1; i<=this.TOTAL_COUNT; i++) {
            var itemInfo = this['_itemInfo' + i] as CommonShopItemCell2;
            if (itemInfo && itemInfo.getItemID() == pos) {
                return itemInfo;
            }
        }
        return null;
    }
}
