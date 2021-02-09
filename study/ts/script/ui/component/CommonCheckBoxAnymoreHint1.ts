const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonCheckBoxAnymoreHint1 extends cc.Component {

   @property({
       type: cc.Label,
       visible: true
   })
   _textNoShow: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _checkBox: cc.Node = null;

}