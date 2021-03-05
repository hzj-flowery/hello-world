const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonPopupSmall extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_bg: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_title_bg: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_title: cc.Label = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _button_close: cc.Button = null;

}