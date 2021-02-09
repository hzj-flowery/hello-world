const {ccclass, property} = cc._decorator;

@ccclass
export default class DailyMissionNode extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _listView: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeDailyValue: cc.Node = null;

}