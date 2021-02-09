const {ccclass, property} = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

@ccclass
export default class CustomActivityThreeKindomsView extends cc.Component {

   @property({
       type: CommonButtonLevel0Highlight,
       visible: true
   })
   _signUP: CommonButtonLevel0Highlight = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDetails: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelRewards: cc.Node = null;

}