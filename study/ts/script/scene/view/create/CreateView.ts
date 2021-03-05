const {ccclass, property} = cc._decorator;

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'

@ccclass
export default class CreateView extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeBgEffect: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodePreEffect: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelDesign: cc.Node = null;

   @property({
       type: CommonHeroAvatar,
       visible: true
   })
   _nodeHeroSpine: CommonHeroAvatar = null;

   @property({
       type: CommonHeroAvatar,
       visible: true
   })
   _nodeHeroSpine2: CommonHeroAvatar = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageTextBG: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelInput: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _nameText: cc.Label = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _btnRandom: cc.Button = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeFrontEffect: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeMale: cc.Node = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _btnMale: cc.Button = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageMaleLight: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeFemale: cc.Node = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _btnFemale: cc.Button = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageFemaleLight: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeTitle: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageTitleMale01: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageTitleMale02: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeTitle2: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageTitleFemale01: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageTitleFemale02: cc.Sprite = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _btnCreate: cc.Button = null;

}