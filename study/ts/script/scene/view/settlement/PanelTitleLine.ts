const {ccclass, property} = cc._decorator;

@ccclass
export default class PanelTitleLine extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _panelBase: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textName: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageLine4: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageLine3: cc.Sprite = null;

}