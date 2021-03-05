const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonActivityTopBarItem extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _node_root: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panel_click: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _background: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _label_numer: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_res_icon: cc.Sprite = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _button_add: cc.Button = null;

}