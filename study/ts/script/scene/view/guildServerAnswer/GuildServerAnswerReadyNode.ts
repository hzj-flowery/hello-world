const {ccclass, property} = cc._decorator;

import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'

@ccclass
export default class GuildServerAnswerReadyNode extends cc.Component {

   @property({
       type: CommonButtonLevel0Normal,
       visible: true
   })
   _btnReady: CommonButtonLevel0Normal = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textCountDown: cc.Label = null;

}