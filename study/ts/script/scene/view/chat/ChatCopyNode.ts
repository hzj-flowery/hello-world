const {ccclass, property} = cc._decorator;

@ccclass
export default class ChatCopyNode extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBg: cc.Sprite = null;

}