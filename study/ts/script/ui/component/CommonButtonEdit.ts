const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonButtonEdit extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _button: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _redPoint: cc.Sprite = null;

}