const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonVipInfo extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _loadingBar: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_VIP_1: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_VIP_2: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _atlasLabel_2: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _atlasLabel_1: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _node_Rich: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_progress: cc.Label = null;

}