import CommonButton from "./CommonButton";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonButtonDelete extends CommonButton {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image: cc.Sprite = null;

}