const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonPageItemSilkbag extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _page_View: cc.Node = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _button_Left: cc.Button = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _button_Right: cc.Button = null;

}