const {ccclass, property} = cc._decorator;

import CommonGuildFlag from '../../../ui/component/CommonGuildFlag'

@ccclass
export default class CityNode extends cc.Component {

   @property({
       type: cc.Button,
       visible: true
   })
   _btnCity: cc.Button = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageProc: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _monsterBlood2: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _monsterBlood1: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _percentText: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _occupiedImage: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _occupiedNode: cc.Node = null;

   @property({
       type: CommonGuildFlag,
       visible: true
   })
   _commonGuildFlag: CommonGuildFlag = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _cityName: cc.Sprite = null;

}