const {ccclass, property} = cc._decorator;

import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode'

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'

@ccclass
export default class PopupGuildCrossWarRank extends cc.Component {

   @property({
       type: CommonNormalLargePop,
       visible: true
   })
   _commonNodeBk: CommonNormalLargePop = null;

   @property({
       type: CommonEmptyListNode,
       visible: true
   })
   _nodeEmpty: CommonEmptyListNode = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _scrollView: cc.Node = null;

}