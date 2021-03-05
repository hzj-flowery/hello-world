const {ccclass, property} = cc._decorator;

@ccclass
export default class PanelDropItem extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _panelBase: cc.Node = null;

}