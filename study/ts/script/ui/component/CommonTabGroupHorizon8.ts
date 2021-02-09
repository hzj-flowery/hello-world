import CommonTabGroupHorizon from "./CommonTabGroupHorizon";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonTabGroupHorizon8 extends CommonTabGroupHorizon {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_normal: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_down: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_desc: cc.Label = null;

}
