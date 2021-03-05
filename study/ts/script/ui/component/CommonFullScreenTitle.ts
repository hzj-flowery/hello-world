const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonFullScreenTitle extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_1: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textTitle: cc.Label = null;

}