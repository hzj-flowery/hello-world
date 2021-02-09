const {ccclass, property} = cc._decorator;

@ccclass
export default class ObserveView extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _resource: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBack: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBtn: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _txtGuildName: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _scrollView: cc.Node = null;

}