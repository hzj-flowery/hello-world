const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonPopupStageDetailBG extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBG: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _textBG: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textStamina: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textStaminaCost: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _textBG2: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textReward: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _starBG: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _starBG2: cc.Sprite = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _btnClose: cc.Button = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _labelBG: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_title: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDrop: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _dropBG: cc.Sprite = null;

}