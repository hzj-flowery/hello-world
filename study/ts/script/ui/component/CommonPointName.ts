const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonPointName extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_BackGround: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_Name: cc.Label = null;

}