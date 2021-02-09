const {ccclass, property} = cc._decorator;

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'

@ccclass
export default class PopupSupportView extends cc.Component {

   @property({
       type: CommonNormalLargePop,
       visible: true
   })
   _commonBk: CommonNormalLargePop = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _listView: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imgDrop: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _txtDesc: cc.Label = null;

}