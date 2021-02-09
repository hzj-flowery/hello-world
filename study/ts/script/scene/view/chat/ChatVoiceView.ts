const {ccclass, property} = cc._decorator;

@ccclass
export default class ChatVoiceView extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelDesign: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageRoot: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _effectNode: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageVoice: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageVoice2: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textHint: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textHint2: cc.Label = null;

}