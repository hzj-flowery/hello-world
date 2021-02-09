const {ccclass, property} = cc._decorator;

import AvatarShopCellNode from './AvatarShopCellNode'
import CommonListItem from '../../../ui/component/CommonListItem';
import { handler } from '../../../utils/handler';

@ccclass
export default class AvatarShopCell extends CommonListItem {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: AvatarShopCellNode,
       visible: true
   })
   _item1: AvatarShopCellNode = null;

   @property({
       type: AvatarShopCellNode,
       visible: true
   })
   _item2: AvatarShopCellNode = null;

   @property({
       type: AvatarShopCellNode,
       visible: true
   })
   _item3: AvatarShopCellNode = null;

   @property({
       type: AvatarShopCellNode,
       visible: true
   })
   _item4: AvatarShopCellNode = null;

   @property({
       type: AvatarShopCellNode,
       visible: true
   })
   _item5: AvatarShopCellNode = null;
onCreate() {
    var size = this._resourceNode.getContentSize();
    this.node.setContentSize(size.width, size.height);
    for (var i = 1; i <= 5; i++) {
        (this['_item' + i] as AvatarShopCellNode).setInitData(handler(this, this._onClickButton), i);
    }
}
protected updateUI(itemId, data){
       this.updateData(data)
}
private updateData(datas) {
    var updateNode = function (index, goodId) {
        if (goodId) {
            this['_item' + index].node.active = (true);
            this['_item' + index].updateUI(goodId);
        } else {
            this['_item' + index].node.active = (false);
        }
    }.bind(this)
    for (var i = 1; i <= 5; i++) {
        var goodId = datas[i-1];
        updateNode(i, goodId);
    }
}
private _onClickButton(index) {
    this.dispatchCustomCallback(index);
}


}