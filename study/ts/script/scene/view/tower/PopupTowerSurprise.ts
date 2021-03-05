const {ccclass, property} = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'

import CommonButtonLargeHighlight from '../../../ui/component/CommonButtonLargeHighlight'

@ccclass
export default class PopupTowerSurprise extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _panelBase: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBG: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageHero: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageTalkBG: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageFace: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textTalk: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageNameBG: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textBoss: cc.Label = null;

   @property({
       type: CommonButtonLargeHighlight,
       visible: true
   })
   _btnChallenge: CommonButtonLargeHighlight = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageLine2: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageLine1: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textReward: cc.Label = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _item1: CommonIconTemplate = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _item2: CommonIconTemplate = null;

}