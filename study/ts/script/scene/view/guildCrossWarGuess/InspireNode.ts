const {ccclass, property} = cc._decorator;

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'

@ccclass
export default class InspireNode extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _resource: cc.Node = null;

   @property({
       type: CommonHeroAvatar,
       visible: true
   })
   _commonAvatar: CommonHeroAvatar = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _txtAtk: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _txtDef: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imgNormal: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imgSelect: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _txtName: cc.Label = null;

}