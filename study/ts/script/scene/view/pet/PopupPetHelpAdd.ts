const {ccclass, property} = cc._decorator;

import CommonEmptyTipNode from '../../../ui/component/CommonEmptyTipNode'

import CommonNormalMiniPop from '../../../ui/component/CommonNormalMiniPop'

@ccclass
export default class PopupPetHelpAdd extends cc.Component {

   @property({
       type: CommonNormalMiniPop,
       visible: true
   })
   _commonBK: CommonNormalMiniPop = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageTopDesc: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textTip: cc.Label = null;

   @property({
       type: CommonEmptyTipNode,
       visible: true
   })
   _fileNodeEmpty: CommonEmptyTipNode = null;

}