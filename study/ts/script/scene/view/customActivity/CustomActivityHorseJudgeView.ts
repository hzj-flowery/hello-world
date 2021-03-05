const {ccclass, property} = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

@ccclass
export default class CustomActivityHorseJudgeView extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeEffect: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textTime: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeTip: cc.Node = null;

   @property({
       type: CommonButtonLevel0Highlight,
       visible: true
   })
   _buttonToRecharge: CommonButtonLevel0Highlight = null;

}