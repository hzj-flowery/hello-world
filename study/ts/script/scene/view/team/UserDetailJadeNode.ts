const {ccclass, property} = cc._decorator;

import TeamEquipIcon from './TeamEquipIcon'
import EquipJadeIcon from '../equipmentJade/EquipJadeIcon';


@ccclass
export default class UserDetailJadeNode extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _slotBar1: cc.Sprite = null;

   @property({
       type: EquipJadeIcon,
       visible: true
   })
   _E1_fileJade1: EquipJadeIcon = null;

   @property({
       type: EquipJadeIcon,
       visible: true
   })
   _E1_fileJade2: EquipJadeIcon = null;

   @property({
       type: EquipJadeIcon,
       visible: true
   })
   _E1_fileJade3: EquipJadeIcon = null;

   @property({
       type: EquipJadeIcon,
       visible: true
   })
   _E1_fileJade4: EquipJadeIcon = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _canNotInjectJade1: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _slotBar2: cc.Sprite = null;

   @property({
       type: EquipJadeIcon,
       visible: true
   })
   _E2_fileJade1: EquipJadeIcon = null;

   @property({
       type: EquipJadeIcon,
       visible: true
   })
   _E2_fileJade2: EquipJadeIcon = null;

   @property({
       type: EquipJadeIcon,
       visible: true
   })
   _E2_fileJade3: EquipJadeIcon = null;

   @property({
       type: EquipJadeIcon,
       visible: true
   })
   _E2_fileJade4: EquipJadeIcon = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _canNotInjectJade2: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _slotBar3: cc.Sprite = null;

   @property({
       type: EquipJadeIcon,
       visible: true
   })
   _E3_fileJade1: EquipJadeIcon = null;

   @property({
       type: EquipJadeIcon,
       visible: true
   })
   _E3_fileJade2: EquipJadeIcon = null;

   @property({
       type: EquipJadeIcon,
       visible: true
   })
   _E3_fileJade3: EquipJadeIcon = null;

   @property({
       type: EquipJadeIcon,
       visible: true
   })
   _E3_fileJade4: EquipJadeIcon = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _canNotInjectJade3: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _slotBar4: cc.Sprite = null;

   @property({
       type: EquipJadeIcon,
       visible: true
   })
   _E4_fileJade1: EquipJadeIcon = null;

   @property({
       type: EquipJadeIcon,
       visible: true
   })
   _E4_fileJade2: EquipJadeIcon = null;

   @property({
       type: EquipJadeIcon,
       visible: true
   })
   _E4_fileJade3: EquipJadeIcon = null;

   @property({
       type: EquipJadeIcon,
       visible: true
   })
   _E4_fileJade4: EquipJadeIcon = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _canNotInjectJade4: cc.Label = null;

   @property({
       type: TeamEquipIcon,
       visible: true
   })
   _fileNode1: TeamEquipIcon = null;

   @property({
       type: TeamEquipIcon,
       visible: true
   })
   _fileNode2: TeamEquipIcon = null;

   @property({
       type: TeamEquipIcon,
       visible: true
   })
   _fileNode3: TeamEquipIcon = null;

   @property({
       type: TeamEquipIcon,
       visible: true
   })
   _fileNode4: TeamEquipIcon = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _buttonEquip: cc.Button = null;

}