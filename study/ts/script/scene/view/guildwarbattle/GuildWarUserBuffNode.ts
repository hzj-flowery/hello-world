const {ccclass, property} = cc._decorator;

@ccclass
export default class GuildWarUserBuffNode extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBuff1: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBuff2: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBuff3: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBuff4: cc.Sprite = null;

}