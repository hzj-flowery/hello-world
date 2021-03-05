const {ccclass, property} = cc._decorator;

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'

@ccclass
export default class PanelTwoItems extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _panelBase: cc.Node = null;

   @property({
       type: CommonResourceInfo,
       visible: true
   })
   _reward1: CommonResourceInfo = null;

   @property({
       type: CommonResourceInfo,
       visible: true
   })
   _reward2: CommonResourceInfo = null;

}