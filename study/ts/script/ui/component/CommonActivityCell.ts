const {ccclass, property} = cc._decorator;

import CommonButtonSwitchLevel1 from './CommonButtonSwitchLevel1'

@ccclass
export default class CommonActivityCell extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _cellBg: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_2: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _iconParent: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _title: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageReceive: cc.Sprite = null;

   @property({
       type: CommonButtonSwitchLevel1,
       visible: true
   })
   _commonButtonSwitchLevel1: CommonButtonSwitchLevel1 = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _richTextParent: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageDiscount: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDiscount: cc.Label = null;

}