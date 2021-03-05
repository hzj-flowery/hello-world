const {ccclass, property} = cc._decorator;

import CommonButtonLevel0Highlight from '../../../../ui/component/CommonButtonLevel0Highlight'

import CommonFullScreenActivityTitle from '../../../../ui/component/CommonFullScreenActivityTitle'

@ccclass
export default class RechargeRebate extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: CommonFullScreenActivityTitle,
       visible: true
   })
   _actTitle: CommonFullScreenActivityTitle = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _textParent: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _curRecharge: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _nextGet: cc.Label = null;

   @property({
       type: CommonButtonLevel0Highlight,
       visible: true
   })
   _btnGotoRecharge: CommonButtonLevel0Highlight = null;

}