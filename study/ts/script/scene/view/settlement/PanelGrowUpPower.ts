const {ccclass, property} = cc._decorator;

@ccclass
export default class PanelGrowUpPower extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _panelBase: cc.Node = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _btnWay3: cc.Button = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _title3: cc.Sprite = null;

}