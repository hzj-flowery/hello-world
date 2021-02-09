const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonFullScreen2_1 extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _panelBg: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_1: cc.Sprite = null;

}