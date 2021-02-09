const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonDetailWindow extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _image_bg_all: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _background: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_319: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _listView: cc.Node = null;

}