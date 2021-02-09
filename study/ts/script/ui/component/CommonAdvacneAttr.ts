const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonAdvacneAttr extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _panel_root: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _node_left: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_desc: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_value: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _node_mid: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_arrow1: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _node_right: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_up_value: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_add_value: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_arrow: cc.Sprite = null;

}