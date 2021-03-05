const {ccclass, property} = cc._decorator;

import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal'

import CommonPetProperty from '../../../ui/component/CommonPetProperty'

import CommonPageItem from '../../../ui/component/CommonPageItem'

import CommonHeroCountryFlag from '../../../ui/component/CommonHeroCountryFlag'

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import PopupBase from '../../../ui/PopupBase';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import UIHelper from '../../../utils/UIHelper';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { G_UserData, Colors } from '../../../init';
import PopupItemGuider from '../../../ui/PopupItemGuider';
import { Path } from '../../../utils/Path';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';

@ccclass
export default class PopupPetDetail extends PopupBase {

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _commonBg: CommonNormalLargePop = null;

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
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _btnWayGet: CommonButtonLevel1Normal = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _hasText: cc.Label = null;

    private _isPage:boolean;
    private _type:number;
    private _value:any;
    private _isShowDrawing:boolean;
    private _avatarPageItems:any;
    private _curSelectedPos:number;
    private _petBaseId:number;
    private _dataList:any[];

    public static path:string = 'pet/PopupPetDetail';

    ctor(type, value, isPage = false) {
        this._type = type;
        this._value = value;
        this._isPage = isPage;
        UIHelper.addEventListener(this.node, this._btnWayGet._button, 'PopupPetDetail', '_onBtnWayGetClicked');
    }
    onCreate() {
        this._btnWayGet.setString(Lang.get('way_type_goto_get'));
        this._commonBg.addCloseEventListener(handler(this, this._onBtnClose));
        this._commonBg.setTitle(Lang.get('pet_detail_title'));
        this._isShowDrawing = false;
        this._avatarPageItems = null;
        this._curSelectedPos = 0;
    }
    onEnter() {
        if (!this._isPage) {
            var dataList = [{ cfg: { id: this._value } }];
            this.setPageData(dataList);
        }
    }
    onExit() {
    }
    _updateUnitInfo(petBaseId) {
        this._petBaseId = petBaseId;
        this._fileNodeCountryFlag.updateUI(TypeConvertHelper.TYPE_PET, petBaseId);
        this._detailWindow.updateUI(null, petBaseId);
        var havePet = G_UserData.getPet().isPetHave(petBaseId);
        var color = havePet && Colors.DARK_BG_THREE || Colors.BRIGHT_BG_RED;
        this._hasText.node.color = (color);
        this._hasText.string = (havePet && Lang.get('common_have') || Lang.get('common_not_have'));
    }
    _onBtnWayGetClicked() {
        var type = this._type;
        var value = this._value;
        UIPopupHelper.popupItemGuider(function (popup:PopupItemGuider) {
            popup.setTitle(Lang.get('way_type_get'));
            popup.updateUI(type, value);
        })
    }
    _updateDrawing(show) {
        this._scrollPage.setCurPage(this._curSelectedPos);
    }
    _onBtnClose() {
        this.close();
    }
    setPageData(dataList:any[]) {
        var selectPos = 0;
        for (let i=0; i<dataList.length; i++) {
            var data = dataList[i];
            if (data.cfg.id == this._value) {
                selectPos = i;
            }
        }
        this._setScrollPage(dataList, selectPos);
    }
    _setScrollPage(dataList, selectPos) {
        this._dataList = dataList;
        this._scrollPage.setCallBack(handler(this, this._updateAvatarItem));
        this._scrollPage.setUserData(dataList, selectPos+1);
    }
    _updateAvatarItem(sender, widget, index, selectPos) {
        var data = this._dataList[index];
        if (data == null) {
            return;
        }
        this._avatarPageItems = this._scrollPage.getPageItems();
        var petBaseId = data.cfg.id;
        if (this._avatarPageItems) {
            var avatarItem = this._avatarPageItems[index];
            if (avatarItem) {
                var avatarCount = avatarItem.getChildrenCount();
                if (avatarCount == 0) {
                    var posx = this._scrollPage.getPageSize().width / 2;
                    var posy = this._scrollPage.getPageSize().height / 2 - 150;
                    PopupBase.loadCommonPrefab('CommonHeroAvatar',(avatar:CommonHeroAvatar)=>{
                        avatar.init();
                        avatarItem.addChild(avatar.node);
                        avatar.setConvertType(TypeConvertHelper.TYPE_PET);
                        avatar.updateUI(petBaseId, '_small');
                        avatar.setScale(2);
                        avatar.node.setPosition(cc.v2(posx, posy));
                    });
                }
            }
        }
        if (selectPos-1 == index) {
            if (this._curSelectedPos != selectPos) {
                this._value = petBaseId;
                this._curSelectedPos = selectPos;
                this._updateUnitInfo(petBaseId);
            }
        }
    }
}
