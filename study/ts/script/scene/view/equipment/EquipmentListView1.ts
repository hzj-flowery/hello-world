const {ccclass, property} = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'

import CommonTabGroupHorizon from '../../../ui/component/CommonTabGroupHorizon'

import CommonFullScreen from '../../../ui/component/CommonFullScreen'

import CommonDlgBackground from '../../../ui/component/CommonDlgBackground'

@ccclass
export default class EquipmentListView1 extends cc.Component {

   @property({
       type: CommonDlgBackground,
       visible: true
   })
   _commonBackground: CommonDlgBackground = null;

   @property({
       type: CommonFullScreen,
       visible: true
   })
   _fileNodeBg: CommonFullScreen = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _buttonSale: cc.Button = null;

   @property({
       type: CommonTabGroupHorizon,
       visible: true
   })
   _tabGroup2: CommonTabGroupHorizon = null;

   @property({
       type: CommonTopbarBase,
       visible: true
   })
   _topbarBase: CommonTopbarBase = null;

}