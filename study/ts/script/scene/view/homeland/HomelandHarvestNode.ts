const {ccclass, property} = cc._decorator;

@ccclass
export default class HomelandHarvestNode extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageGetMoney: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textCount: cc.Label = null;

}