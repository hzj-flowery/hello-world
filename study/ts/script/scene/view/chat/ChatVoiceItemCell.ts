const {ccclass, property} = cc._decorator;

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'

@ccclass
export default class ChatVoiceItemCell extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: CommonHeroIcon,
       visible: true
   })
   _commonHeroIcon: CommonHeroIcon = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textServerName: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textPlayerName: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageChannel: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _spriteTitle: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBgRichText: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelRichText: cc.Node = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _voiceBtn: cc.Button = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textVoiceLen: cc.Label = null;

}