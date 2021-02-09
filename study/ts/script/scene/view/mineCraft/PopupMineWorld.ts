const {ccclass, property} = cc._decorator;

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'

import PopupMineWorldNode from './PopupMineWorldNode'

@ccclass
export default class PopupMineWorld extends cc.Component {

   @property({
       type: cc.Button,
       visible: true
   })
   _btnClose: cc.Button = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _countBG: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textCountTime: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textCountDownTitle: cc.Label = null;

   @property({
       type: PopupMineWorldNode,
       visible: true
   })
   _mineNode1: PopupMineWorldNode = null;

   @property({
       type: PopupMineWorldNode,
       visible: true
   })
   _mineNode2: PopupMineWorldNode = null;

   @property({
       type: PopupMineWorldNode,
       visible: true
   })
   _mineNode3: PopupMineWorldNode = null;

   @property({
       type: PopupMineWorldNode,
       visible: true
   })
   _mineNode4: PopupMineWorldNode = null;

   @property({
       type: PopupMineWorldNode,
       visible: true
   })
   _mineNode5: PopupMineWorldNode = null;

   @property({
       type: PopupMineWorldNode,
       visible: true
   })
   _mineNode6: PopupMineWorldNode = null;

   @property({
       type: PopupMineWorldNode,
       visible: true
   })
   _mineNode7: PopupMineWorldNode = null;

   @property({
       type: PopupMineWorldNode,
       visible: true
   })
   _mineNode8: PopupMineWorldNode = null;

   @property({
       type: PopupMineWorldNode,
       visible: true
   })
   _mineNode9: PopupMineWorldNode = null;

   @property({
       type: PopupMineWorldNode,
       visible: true
   })
   _mineNode10: PopupMineWorldNode = null;

   @property({
       type: CommonHeroAvatar,
       visible: true
   })
   _heroAvatar: CommonHeroAvatar = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageRebornName: cc.Sprite = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _btnChange: cc.Button = null;

}