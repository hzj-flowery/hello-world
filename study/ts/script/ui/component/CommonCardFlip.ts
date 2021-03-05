const {ccclass, property} = cc._decorator;

import CommonIconTemplate from './CommonIconTemplate'

@ccclass
export default class CommonCardFlip extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _node_con: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_glow: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_back: cc.Sprite = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _commonIcon: CommonIconTemplate = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_front: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panel_touch_flip: cc.Node = null;

}