const {ccclass, property} = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'

import CommonFullScreenListView from '../../../ui/component/CommonFullScreenListView'

import CommonDlgBackground from '../../../ui/component/CommonDlgBackground'

@ccclass
export default class PackageView1 extends cc.Component {

   @property({
       type: CommonDlgBackground,
       visible: true
   })
   _commonBackground: CommonDlgBackground = null;

   @property({
       type: CommonFullScreenListView,
       visible: true
   })
   _commonFullScreen: CommonFullScreenListView = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _buttonSale: cc.Button = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _saleImage: cc.Sprite = null;

   @property({
       type: CommonTopbarBase,
       visible: true
   })
   _topbarBase: CommonTopbarBase = null;

}