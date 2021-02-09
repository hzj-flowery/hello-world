const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonBuyNode extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _scrollView_1: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _background: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _content: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _vScrollBar: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _bar: cc.Sprite = null;

}