const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonTabGroupScrollVertical2 extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _scrollViewTab: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _content: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _commonTabGroup: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panel_tab: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_select: cc.Sprite = null;

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