const {ccclass, property} = cc._decorator;

@ccclass
export default class CommoRedPointNum extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageRedPoint: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textNum: cc.Label = null;

}