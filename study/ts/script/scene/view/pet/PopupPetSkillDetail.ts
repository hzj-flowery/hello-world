const {ccclass, property} = cc._decorator;

import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal'

import CommonPetProperty from '../../../ui/component/CommonPetProperty'

import CommonPageItem from '../../../ui/component/CommonPageItem'

import CommonHeroCountryFlag from '../../../ui/component/CommonHeroCountryFlag'

@ccclass
export default class PopupPetSkillDetail extends cc.Component {

   @property({
       type: cc.Label,
       visible: true
   })
   _textTitle: cc.Label = null;

   @property({
       type: CommonHeroCountryFlag,
       visible: true
   })
   _fileNodeCountryFlag: CommonHeroCountryFlag = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _heroStage: cc.Sprite = null;

   @property({
       type: CommonPageItem,
       visible: true
   })
   _scrollPage: CommonPageItem = null;

   @property({
       type: CommonPetProperty,
       visible: true
   })
   _detailWindow: CommonPetProperty = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _buttonClose: cc.Button = null;

   @property({
       type: CommonButtonLevel1Normal,
       visible: true
   })
   _btnWayGet: CommonButtonLevel1Normal = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _hasText: cc.Label = null;

}