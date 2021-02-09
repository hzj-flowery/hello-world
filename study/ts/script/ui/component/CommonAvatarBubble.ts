const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonAvatarBubble extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_talk_bg: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_talk: cc.Label = null;

}