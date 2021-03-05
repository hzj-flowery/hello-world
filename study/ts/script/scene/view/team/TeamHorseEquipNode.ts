const {ccclass, property} = cc._decorator;

import TeamHorseEquipIcon from './TeamHorseEquipIcon'

@ccclass
export default class TeamHorseEquipNode extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _panelDesign: cc.Node = null;

   @property({
       type: TeamHorseEquipIcon,
       visible: true
   })
   _fileNodeEquip1: TeamHorseEquipIcon = null;

   @property({
       type: TeamHorseEquipIcon,
       visible: true
   })
   _fileNodeEquip2: TeamHorseEquipIcon = null;

   @property({
       type: TeamHorseEquipIcon,
       visible: true
   })
   _fileNodeEquip3: TeamHorseEquipIcon = null;

}