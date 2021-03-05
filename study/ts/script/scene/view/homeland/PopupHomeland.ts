const {ccclass, property} = cc._decorator;

import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode'

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'

@ccclass
export default class PopupHomeland extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _panelBase: cc.Node = null;

   @property({
       type: CommonNormalLargePop,
       visible: true
   })
   _commonBk: CommonNormalLargePop = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _listItemSource: cc.Node = null;

   @property({
       type: CommonEmptyListNode,
       visible: true
   })
   _nodeEmpty: CommonEmptyListNode = null;

}