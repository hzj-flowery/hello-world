const {ccclass, property} = cc._decorator;

import CommonShopItemCell from '../../../ui/component/CommonShopItemCell'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { handler } from '../../../utils/handler';

@ccclass
export default class GoldHeroShopItemCell extends ListViewCellBase {

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

    onInit(){
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    onCreate() {
        this._initResourceView();
    }
    _initResourceView() {
        for (var i = 1; i<=2; i++) {
            var item = this['_itemInfo' + i];
            if (item) {
                item.setVisible(false);
            }
        }
    }
    updateUI(index, itemLine:any[], tabIdx) {
        for (var i = 1; i<=2; i++) {
            var item = this['_itemInfo' + i];
            if (item) {
                item.setVisible(false);
            }
        }
        for (var i=1; i<=itemLine.length; i++) {
            var item = itemLine[i-1];
            var itemInfo = this['_itemInfo' + i];
            if (itemInfo) {
                itemInfo.updateUI(item, tabIdx == 1);
                itemInfo.setVisible(true);
                itemInfo.node.name = (i + index * 2).toString();
                itemInfo.setCallBack(handler(this, this._onBtnClick));
                var discount = item.getConfig().discount || 0;
                itemInfo.updateDiscount(parseInt(discount));
            }
        }
    }
    _onBtnClick(iconNameNode) {
        var curSelectedPos = parseInt(iconNameNode.node.name);
        this.dispatchCustomCallback(curSelectedPos);
    }
    findItemByPos(pos) {
        for (var i = 1; i<=2; i++) {
            var itemInfo = this['_itemInfo' + i];
            var index = parseInt(itemInfo.node.name);
            if (itemInfo && index == pos) {
                return itemInfo;
            }
        }
        return null;
    }    

}
