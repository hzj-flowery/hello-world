const {ccclass, property} = cc._decorator;

import CommonColorProgress from '../../../ui/component/CommonColorProgress'

@ccclass
export default class EnemyListView extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _resource: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _cityNode: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBg: cc.Sprite = null;

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

   @property({
       type: cc.Label,
       visible: true
   })
   _textCdTitle: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textTime: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _scrollView: cc.Node = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _btnArrow: cc.Button = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageArrow: cc.Sprite = null;

}