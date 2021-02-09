const {ccclass, property} = cc._decorator;

import CommonButtonLevel0Highlight from '../../../../ui/component/CommonButtonLevel0Highlight'

import CommonFullScreenActivityTitle from '../../../../ui/component/CommonFullScreenActivityTitle'

@ccclass
export default class BetaAppointmentView extends cc.Component {

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
   _awardsParent1: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _awardsParent2: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _alreadyOrder: cc.Sprite = null;

   @property({
       type: CommonButtonLevel0Highlight,
       visible: true
   })
   _btnOrder: CommonButtonLevel0Highlight = null;

}