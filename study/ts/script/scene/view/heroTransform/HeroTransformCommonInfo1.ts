const {ccclass, property} = cc._decorator;

import CommonAttrNode from '../../../ui/component/CommonAttrNode'

import CommonDesValue from '../../../ui/component/CommonDesValue'

@ccclass
export default class HeroTransformCommonInfo1 extends cc.Component {

   @property({
       type: CommonDesValue,
       visible: true
   })
   _nodeDesValue: CommonDesValue = null;

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

}