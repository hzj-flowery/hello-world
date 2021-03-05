const {ccclass, property} = cc._decorator;

@ccclass
export default class ObserveCell extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _resource: cc.Node = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _btnItem: cc.Button = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _spriteEye: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _txtName: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch: cc.Node = null;

}