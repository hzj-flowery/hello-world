const {ccclass, property} = cc._decorator;

import CommonHorseProperty from '../../../ui/component/CommonHorseProperty'

import CommonButtonLevel5Highlight from '../../../ui/component/CommonButtonLevel5Highlight'

import CommonPageItem from '../../../ui/component/CommonPageItem'

import CommonHorseAvatar from '../../../ui/component/CommonHorseAvatar'

import CommonHeroCountryFlag from '../../../ui/component/CommonHeroCountryFlag'
import PopupBase from '../../../ui/PopupBase';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import PopupItemGuider from '../../../ui/PopupItemGuider';
import { Lang } from '../../../lang/Lang';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { G_UserData } from '../../../init';
import { assert } from '../../../utils/GlobleFunc';
import { HorseDataHelper } from '../../../utils/data/HorseDataHelper';
import { handler } from '../../../utils/handler';

@ccclass
export default class PopupHorseDetail extends PopupBase {

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
       type: CommonHorseAvatar,
       visible: true
   })
   _fileNodeHorse: CommonHorseAvatar = null;

   @property({
       type: CommonPageItem,
       visible: true
   })
   _scrollPage: CommonPageItem = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textSuit: cc.Label = null;

   @property({
       type: CommonButtonLevel5Highlight,
       visible: true
   })
   _btnWayGet: CommonButtonLevel5Highlight = null;

   @property({
       type: CommonHorseProperty,
       visible: true
   })
   _detailWindow: CommonHorseProperty = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _buttonClose: cc.Button = null;

   @property(cc.Prefab)
   commonHorseAvatar:cc.Prefab = null;

   public static path:string = 'horse/PopupHorseDetail';

   private _type:number;
   private _value:number;
   private _pageAvatars:any;
   private _horseUnitData:any;
   private _dataList:any;

    ctor(type, value) {
        this._type = type;
        this._value = value;
        this._updateUnitData(type, value);
        UIHelper.addEventListener(this.node, this._btnWayGet._button, 'PopupHorseDetail', '_onBtnWayGetClicked');
        UIHelper.addEventListener(this.node, this._buttonClose, 'PopupHorseDetail', '_onBtnClose');
    }
    onCreate() {

    }
    onEnter() {
        this._pageAvatars = {};
        this._updateHorseInfo(this._value);
        this._fileNodeHorse.node.active = (true);
        this._fileNodeHorse.showShadow(false);
        this._scrollPage.node.active = (false);
    }
    onExit() {
    }
    _onBtnWayGetClicked() {
        var type = this._type;
        var value = this._value;
        UIPopupHelper.popupItemGuider(function(popup:PopupItemGuider){
            popup.setTitle(Lang.get('way_type_get'));
            popup.updateUI(type, value);
        });
    }
    _onBtnClose() {
        this.close();
    }
    _updateUnitData(type, value) {
        var convertData = TypeConvertHelper.convert(type, value);
        if (convertData == null) {
            return;
        }
        if (type == TypeConvertHelper.TYPE_HORSE) {
            var unitData = G_UserData.getHorse().createTempHorseUnitData(value);
            this._horseUnitData = unitData;
        } else if (type == TypeConvertHelper.TYPE_FRAGMENT) {
            var heroId = convertData.cfg.comp_value;
            var unitData = G_UserData.getHorse().createTempHorseUnitData(heroId);
            this._horseUnitData = unitData;
        }
        if (this._horseUnitData == null) {
          //assert((false, 'can\'t find horse by id : ' + value);
        }
    }
    _updateHorseInfo(baseId) {
        this._value = baseId;
        this._updateUnitData(this._type, this._value);
        this._detailWindow.updateUI(this._horseUnitData);
        this._btnWayGet.setString(Lang.get('way_type_goto_get'));
        this._fileNodeCountryFlag.updateUI(TypeConvertHelper.TYPE_HORSE, this._horseUnitData.getBase_id());
        this._fileNodeHorse.updateUI(this._horseUnitData.getBase_id());
        this._fileNodeHorse.playAnimationOnce('win');
        HorseDataHelper.playVoiceWithId(baseId);
        var strSuit = HorseDataHelper.getHorseConfig(this._horseUnitData.getBase_id()).type;
        this._textSuit.string = (Lang.get('horse_suit_ride_tip2', { type: strSuit }));
    }
    setPageData(dataList, params) {
        this._dataList = dataList;
        this._scrollPage.setCallBack(handler(this, this._updateItemAvatar));
        this._scrollPage.node.active = (true);
        this._fileNodeHorse.node.active = (false);
        var selectPos = 0;
        for (let i in this._dataList) {
            var data = this._dataList[i];
            if (data.cfg.id == this._value) {
                selectPos = parseInt(i);
            }
        }
        this._scrollPage.setUserData(dataList, selectPos);
    }
    _updateItemAvatar(sender, widget, index, selectPos) {
        var data = this._dataList[index];
        if (data == null) {
            return;
        }
        var baseId = data.cfg.id;
        var count = widget.getChildrenCount();
        if (count == 0) {
            var node = cc.instantiate(this.commonHorseAvatar);
            var avatar = node.getComponent(CommonHorseAvatar);
            avatar.updateUI(baseId);
            avatar.showShadow(false);
            avatar.showEffect(true);
            avatar.node.setPosition(cc.v2(this._scrollPage.getPageSize().width / 2, this._scrollPage.getPageSize().height / 2 - 150));
            widget.addChild(avatar);
            this._pageAvatars[index] = avatar;
        }
        if (selectPos == index) {
            this._updateHorseInfo(baseId);
        }
        var avatar1 = this._pageAvatars[index];
        if (avatar1) {
            avatar1.playAnimationOnce('win');
            HorseDataHelper.playVoiceWithId(baseId);
        }
    }

}
