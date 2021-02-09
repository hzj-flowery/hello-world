const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonLevelStar extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _panel_7: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageStar1: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageStar2: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageStar3: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageStar4: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageStar5: cc.Sprite = null;

   setCount(v0, v1){

   }

}