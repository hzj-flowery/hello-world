const {ccclass, property} = cc._decorator;

@ccclass
export default class PanelValueAdvance extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _panelBase: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textCurr: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textNext: cc.Label = null;

}