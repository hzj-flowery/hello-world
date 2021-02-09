const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonLoadingBar extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_37: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _loadingbar3: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _loadingbar2: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _loadingbar1: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _percentText: cc.Label = null;

}