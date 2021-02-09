const {ccclass, property} = cc._decorator;

@ccclass
export default class AcDailyMissionActiviyValue extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _panelCon: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textCurActivity: cc.Label = null;

}