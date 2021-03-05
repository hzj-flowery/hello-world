const {ccclass, property} = cc._decorator;

import CommonLoadingBar from '../../../ui/component/CommonLoadingBar'

import CommonHeadFrame from '../../../ui/component/CommonHeadFrame'

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'

@ccclass
export default class WarringLeftPanel extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _resource: cc.Node = null;

   @property({
       type: CommonHeroIcon,
       visible: true
   })
   _fileNodeIcon: CommonHeroIcon = null;

   @property({
       type: CommonHeadFrame,
       visible: true
   })
   _commonFrame: CommonHeadFrame = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _playerName: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _playerPower: cc.Label = null;

   @property({
       type: CommonLoadingBar,
       visible: true
   })
   _commonProgress: CommonLoadingBar = null;

}