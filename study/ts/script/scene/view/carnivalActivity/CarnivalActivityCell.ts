const {ccclass, property} = cc._decorator;

import CommonActivityCell from '../../../ui/component/CommonActivityCell'

@ccclass
export default class CarnivalActivityCell extends cc.Component {

   @property({
       type: CommonActivityCell,
       visible: true
   })
   _commonActivityCell: CommonActivityCell = null;

}