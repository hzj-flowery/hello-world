const {ccclass, property} = cc._decorator;

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'

@ccclass
export default class GuildCrossWarMonsterAvatar extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _pkAvatar: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _hookAvatar: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _monumentAvatar: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _avatarState: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _avatarReborn: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeRole: cc.Node = null;

   @property({
       type: CommonHeroAvatar,
       visible: true
   })
   _commonHeroAvatar: CommonHeroAvatar = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeAvatarInfo: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _avatarName: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeEffect: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _monsterBlood: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _percentText: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _touchPanel: cc.Node = null;

}