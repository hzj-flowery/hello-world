const {ccclass, property} = cc._decorator;

@ccclass
export default class GuildServerAnswerRestNode extends cc.Component {

   @property({
       type: cc.Label,
       visible: true
   })
   _textCountDown: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _restIng: cc.Label = null;

}