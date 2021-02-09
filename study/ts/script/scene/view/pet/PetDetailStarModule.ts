const {ccclass, property} = cc._decorator;

import CommonButtonLevel2Highlight from '../../../ui/component/CommonButtonLevel2Highlight'

import CommonHeroStar from '../../../ui/component/CommonHeroStar'

import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg'

@ccclass
export default class PetDetailStarModule extends cc.Component {

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
       type: CommonHeroStar,
       visible: true
   })
   _fileNodeStar: CommonHeroStar = null;

   @property({
       type: CommonButtonLevel2Highlight,
       visible: true
   })
   _buttonStar: CommonButtonLevel2Highlight = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _loadingBarProgress: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _expPanelClick: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textProgress: cc.Label = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _buttonAdd: cc.Button = null;

}