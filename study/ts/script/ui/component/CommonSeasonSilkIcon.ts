const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonSeasonSilkIcon extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBg: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageMidBg: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageIcon: cc.Sprite = null;

}