const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonHistoryAvatarNode extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _panel_click: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _node_hero: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeAvatarEffect: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_shadow: cc.Sprite = null;

}