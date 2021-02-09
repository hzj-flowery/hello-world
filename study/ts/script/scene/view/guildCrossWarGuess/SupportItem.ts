const {ccclass, property} = cc._decorator;

import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal'

import CommonGuildFlag from '../../../ui/component/CommonGuildFlag'

@ccclass
export default class SupportItem extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _resource: cc.Node = null;

   @property({
       type: CommonGuildFlag,
       visible: true
   })
   _commonFlag: CommonGuildFlag = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _txtGuildLeader: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _txtPower: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _txtPoint: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _txtSupport: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _txtSupportSoilder: cc.Label = null;

   @property({
       type: CommonButtonLevel1Normal,
       visible: true
   })
   _commonSupport: CommonButtonLevel1Normal = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageSupported: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imgConsume: cc.Sprite = null;

}