const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonTabGroupHorizonClassify3 extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _panel_tab: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_normal: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_down: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_desc: cc.Label = null;

}