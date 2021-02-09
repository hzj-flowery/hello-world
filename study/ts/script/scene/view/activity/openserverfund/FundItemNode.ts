const {ccclass, property} = cc._decorator;

import CommonButtonLevel2Normal from '../../../../ui/component/CommonButtonLevel2Normal'

import CommonIconTemplate from '../../../../ui/component/CommonIconTemplate'

@ccclass
export default class FundItemNode extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageRoot: cc.Sprite = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _commonIconTemplate: CommonIconTemplate = null;

   @property({
       type: CommonButtonLevel2Normal,
       visible: true
   })
   _commonButtonMediumNormal: CommonButtonLevel2Normal = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textItemName: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeCondition: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageReceive: cc.Sprite = null;

}