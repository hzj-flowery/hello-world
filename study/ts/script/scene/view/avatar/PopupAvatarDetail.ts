const {ccclass, property} = cc._decorator;

import CommonVerticalText from '../../../ui/component/CommonVerticalText'

import CommonAvatarProperty from '../../../ui/component/CommonAvatarProperty'

import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal'

import CommonPageItem from '../../../ui/component/CommonPageItem'

import CommonAvatarAvatar from '../../../ui/component/CommonAvatarAvatar'

import CommonHeroCountryFlag from '../../../ui/component/CommonHeroCountryFlag'
import PopupBase from '../../../ui/PopupBase';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { G_UserData } from '../../../init';
import { assert } from '../../../utils/GlobleFunc';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import PopupItemGuider from '../../../ui/PopupItemGuider';

@ccclass
export default class PopupAvatarDetail extends PopupBase {

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
       type: CommonAvatarAvatar,
       visible: true
   })
   _fileNodeAvatar: CommonAvatarAvatar = null;

   @property({
       type: CommonPageItem,
       visible: true
   })
   _scrollPage: CommonPageItem = null;

   @property({
       type: CommonButtonLevel1Normal,
       visible: true
   })
   _btnWayGet: CommonButtonLevel1Normal = null;

   @property({
       type: CommonAvatarProperty,
       visible: true
   })
   _detailWindow: CommonAvatarProperty = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _buttonClose: cc.Button = null;

   @property({
       type: CommonVerticalText,
       visible: true
   })
   _commonVerticalText: CommonVerticalText = null;

   public static path:string = 'avatar/PopupAvatarDetail';

    private _type:number;
    private _value:number;
    private _unitData:any;
    private _dataList:any;

    ctor(type, value) {
        this._type = type;
        this._value = value;
        this._updateUnitData(type, value);
    }
    onCreate() {
       
        this._fileNodeAvatar.node.active = (true);
        this._scrollPage.node.active = (false);

        UIHelper.addEventListener(this.node, this._buttonClose, 'PopupAvatarDetail', '_onBtnClose');
        UIHelper.addEventListener(this.node, this._btnWayGet._button, 'PopupAvatarDetail', '_onBtnWayGetClicked');
    }
    onEnter() {
        this._updateAvatarInfo(this._value);
    }
    onExit() {
    }
    _onBtnWayGetClicked() {
        PopupBase.loadCommonPrefab('PopupItemGuider',(popup:PopupItemGuider)=>{
            popup.updateUI(this._type, this._value);
            popup.setTitle(Lang.get('way_type_get'));
            popup.openWithAction();
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
        if (type == TypeConvertHelper.TYPE_AVATAR) {
            var data = { base_id: value };
            var unitData = G_UserData.getAvatar().createTempAvatarUnitData(data);
            this._unitData = unitData;
        }
        if (this._unitData == null) {
          //assert((false, 'can\'t find avatar by id : ' + value);
        }
    }
    _updateAvatarInfo(baseId) {
        this._value = baseId;
        this._updateUnitData(this._type, this._value);
        this._detailWindow.updateUI(this._unitData);
        this._btnWayGet.setString(Lang.get('way_type_goto_get'));
        this._fileNodeCountryFlag.updateUI(TypeConvertHelper.TYPE_AVATAR, this._unitData.getBase_id());
        this._fileNodeAvatar._init();
        this._fileNodeAvatar.updateUI(this._unitData.getBase_id());
        var param = TypeConvertHelper.convert(this._type, this._value);
        this._commonVerticalText.setString(param.name);
    }
    setPageData(dataList, params) {
        this._dataList = dataList;
        this._scrollPage.setCallBack(handler(this, this._updateItemAvatar));
        this._scrollPage.node.active = (true);
        this._fileNodeAvatar.node.active = (false);
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
            PopupBase.loadCommonPrefab('CommonAvatarAvatar',(avatar:CommonAvatarAvatar)=>{
                avatar.updateUI(baseId);
                // avatar.showShadow(false);
                avatar.node.setPosition(cc.v2(this._scrollPage.getPageSize().width / 2, this._scrollPage.getPageSize().height / 2));
                widget.addChild(avatar);
            });

        }
        if (selectPos == index) {
            this._updateAvatarInfo(baseId);
        }
    }
}
