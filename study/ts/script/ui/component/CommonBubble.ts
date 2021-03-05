const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonBubble extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imagePopo: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_1: cc.Label = null;

}