const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonAwardTip extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBG: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageRes: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textValue: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textRes: cc.Label = null;

}