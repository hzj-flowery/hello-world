const {ccclass, property} = cc._decorator;

import CommonColorProgress from '../../../ui/component/CommonColorProgress'

import CommonGuildFlagVertical from '../../../ui/component/CommonGuildFlagVertical'

@ccclass
export default class EnemyListCell extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBg: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textName: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textPower: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _barGreen: cc.Sprite = null;

   @property({
       type: CommonGuildFlagVertical,
       visible: true
   })
   _commonGuildFlag: CommonGuildFlagVertical = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeSword: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch: cc.Node = null;

   @property({
       type: CommonColorProgress,
       visible: true
   })
   _colorProgress: CommonColorProgress = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textCityName: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textCityHpTitle: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textBuildingHp: cc.Label = null;

}