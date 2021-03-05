const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonButtonSmallNormal2 extends cc.Component {

   @property({
       type: cc.Button,
       visible: true
   })
   _button: cc.Button = null;

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