const {ccclass, property} = cc._decorator;

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'

@ccclass
export default class GuildTaskCell extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _panelCon: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textTitleName: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDesc: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDesc2: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textValue: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageComplete: cc.Sprite = null;

   @property({
       type: CommonButtonLevel1Highlight,
       visible: true
   })
   _buttonOK: CommonButtonLevel1Highlight = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeProgress: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageIcon: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch: cc.Node = null;

}