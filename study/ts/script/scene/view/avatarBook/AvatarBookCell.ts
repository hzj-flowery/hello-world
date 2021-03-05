const {ccclass, property} = cc._decorator;

import AvatarBookDrawNode from './AvatarBookDrawNode'
import CommonListItem from '../../../ui/component/CommonListItem';
import { handler } from '../../../utils/handler';

@ccclass
export default class AvatarBookCell extends CommonListItem {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: AvatarBookDrawNode,
       visible: true
   })
   _item1: AvatarBookDrawNode = null;

   @property({
       type: AvatarBookDrawNode,
       visible: true
   })
   _item2: AvatarBookDrawNode = null;

   @property({
       type: AvatarBookDrawNode,
       visible: true
   })
   _item3: AvatarBookDrawNode = null;

   onLoad() {
    var size = this._resourceNode.getContentSize();
    this.node.setContentSize(size.width, size.height);
    super.onLoad();
}

onEnter(){
    this._item1.setInitData(handler(this,this._onClickActive1));
    this._item2.setInitData(handler(this,this._onClickActive2));
    this._item3.setInitData(handler(this,this._onClickActive3));
}
updateUI(itemId,bookId) {
    var updateCell = function (bookId, index) {
        if (bookId) {
            (this['_item' + index] as AvatarBookDrawNode).node.active = (true);
            (this['_item' + index] as AvatarBookDrawNode).updateUI(bookId);
        } else {
            (this['_item' + index] as AvatarBookDrawNode).node.active = (false);
        }
    }.bind(this)
    updateCell(bookId[0], 1);
    updateCell(bookId[1], 2);
    updateCell(bookId[2], 3);
}
_onClickActive1() {
    this.dispatchCustomCallback(1);
}
_onClickActive2() {
    this.dispatchCustomCallback(2);
}
_onClickActive3() {
    this.dispatchCustomCallback(3);
}

}