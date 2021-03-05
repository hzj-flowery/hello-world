const {ccclass, property} = cc._decorator;

import CommonButtonLevel2Highlight from '../../../ui/component/CommonButtonLevel2Highlight'

import CommonAttrNode from '../../../ui/component/CommonAttrNode'

import CommonDesValue from '../../../ui/component/CommonDesValue'

import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg'

@ccclass
export default class PetDetailAttrModuleEx extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _panelBg: cc.Node = null;

   @property({
       type: CommonDetailTitleWithBg,
       visible: true
   })
   _nodeTitle: CommonDetailTitleWithBg = null;

   @property({
       type: CommonDesValue,
       visible: true
   })
   _nodeLevel: CommonDesValue = null;

   @property({
       type: CommonAttrNode,
       visible: true
   })
   _nodeAttr1: CommonAttrNode = null;

   @property({
       type: CommonAttrNode,
       visible: true
   })
   _nodeAttr2: CommonAttrNode = null;

   @property({
       type: CommonAttrNode,
       visible: true
   })
   _nodeAttr3: CommonAttrNode = null;

   @property({
       type: CommonAttrNode,
       visible: true
   })
   _nodeAttr4: CommonAttrNode = null;

   @property({
       type: CommonButtonLevel2Highlight,
       visible: true
   })
   _buttonUpgrade: CommonButtonLevel2Highlight = null;

}