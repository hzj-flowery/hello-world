const {ccclass, property} = cc._decorator;

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'

@ccclass
export default class PopupHomelandFriendUp extends cc.Component {

   @property({
       type: CommonNormalLargePop,
       visible: true
   })
   _commonNodeBk: CommonNormalLargePop = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _attrNode1: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _attrNode2: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _attrNode3: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageArrow: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textLevelDesc: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageRankMax: cc.Sprite = null;

}