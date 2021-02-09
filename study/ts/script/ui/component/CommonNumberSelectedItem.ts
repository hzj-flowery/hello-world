const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonNumberSelectedItem extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _listView: cc.Node = null;

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