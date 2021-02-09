const {ccclass, property} = cc._decorator;

@ccclass
export default class InspireCell extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _resource: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panel1: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panel2: cc.Node = null;

}