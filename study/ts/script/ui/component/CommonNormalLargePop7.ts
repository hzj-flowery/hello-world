const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonNormalLargePop7 extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_bg_all: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_Kuang_left: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_Kuang_right: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_title_left: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_title_right: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_title: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_17: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_17_0: cc.Sprite = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _button_close: cc.Button = null;

}