const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonPageFrame extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_1: cc.Sprite = null;

}