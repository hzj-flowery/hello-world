const { ccclass, property } = cc._decorator;

import CommonHorseEquipProperty from '../../../ui/component/CommonHorseEquipProperty'

import CommonButtonLevel5Highlight from '../../../ui/component/CommonButtonLevel5Highlight'

import CommonPageItem from '../../../ui/component/CommonPageItem'

import CommonHorseEquipAvatar from '../../../ui/component/CommonHorseEquipAvatar'

import CommonHeroCountryFlag from '../../../ui/component/CommonHeroCountryFlag'
import PopupBase from '../../../ui/PopupBase';
import { handler } from '../../../utils/handler';
import UIHelper from '../../../utils/UIHelper';
import { Lang } from '../../../lang/Lang';
import { G_SceneManager, G_UserData } from '../../../init';
import { Path } from '../../../utils/Path';
import PopupItemGuider from '../../../ui/PopupItemGuider';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';

@ccclass
export default class PopupHorseEquipDetail extends PopupBase {

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
        type: cc.Node,
        visible: true
    })
    _heroStage: cc.Node = null;

    @property({
        type: CommonHorseEquipAvatar,
        visible: true
    })
    _fileNodeEquip: CommonHorseEquipAvatar = null;

    @property({
        type: CommonPageItem,
        visible: true
    })
    _scrollPage: CommonPageItem = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPotential: cc.Label = null;

    @property({
        type: CommonButtonLevel5Highlight,
        visible: true
    })
    _btnWayGet: CommonButtonLevel5Highlight = null;

    @property({
        type: CommonHorseEquipProperty,
        visible: true
    })
    _detailWindow: CommonHorseEquipProperty = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _commonHorseEquipAvatarPrefab: cc.Prefab = null;

    private _type;
    private _value;
    private _dataList;
    private _equipUnitData;

    init(type, value) {
        this._type = type;
        this._value = value;
        this._updateUnitData(type, value);
        this._btnWayGet.addClickEventListenerEx(handler(this, this._onBtnWayGetClicked));
    }

    onCreate() {
        this._updateEquipInfo(this._value);
        this._fileNodeEquip.node.active = (true);
        this._fileNodeEquip.showShadow(false);
        this._scrollPage.node.active = (false);
        this._textPotential.node.active = (false);
    }

    onEnter() {
    }

    onExit() {
    }

    _onBtnWayGetClicked() {
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupItemGuider"), (popupItemGuider: PopupItemGuider) => {
            popupItemGuider.setTitle(Lang.get('way_type_get'));
            popupItemGuider.updateUI(this._type, this._value);
            popupItemGuider.openWithAction();
        });
    }

    onBtnClose() {
        this.close();
    }

    _updateUnitData(type, value) {
        var convertData = TypeConvertHelper.convert(type, value);
        if (convertData == null) {
            return;
        }
        if (type == TypeConvertHelper.TYPE_HORSE_EQUIP) {
            var unitData = G_UserData.getHorseEquipment().createTempHorseEquipUnitData(value);
            this._equipUnitData = unitData;
        } else if (type == TypeConvertHelper.TYPE_FRAGMENT) {
            var baseId = convertData.cfg.comp_value;
            // var unitData = G_UserData.getHorseEquipment().createTempEquipUnitData(baseId);
            // this._equipUnitData = unitData;
        }
        if (this._equipUnitData == null) {
        }
    }

    _updateEquipInfo(baseId) {
        this._value = baseId;
        this._updateUnitData(this._type, this._value);
        this._detailWindow.updateUI(this._equipUnitData);
        this._btnWayGet.setString(Lang.get('way_type_goto_get'));
        this._fileNodeCountryFlag.updateUI(TypeConvertHelper.TYPE_HORSE_EQUIP, this._equipUnitData.getBase_id());
        this._fileNodeEquip.updateUI(this._equipUnitData.getBase_id());
    }

    setPageData(dataList, params) {
        this._dataList = dataList;
        this._scrollPage.setCallBack(handler(this, this._updateItemAvatar));
        this._scrollPage.node.active = (true);
        this._fileNodeEquip.node.active = (false);
        var selectPos = 0;
        for (let i in this._dataList) {
            var data = this._dataList[i];
            if (data.cfg.id == this._value) {
                selectPos = parseInt(i);
            }
        }
        this._scrollPage.setUserData(dataList, selectPos);
    }

    _updateItemAvatar(sender, widget:cc.Node, index, selectPos) {
        var data = this._dataList[index];
        if (data == null) {
            return;
        }
        var baseId = data.cfg.id;
        var count = widget.childrenCount;
        if (count == 0) {
            var avatar = cc.instantiate(this._commonHorseEquipAvatarPrefab).getComponent(CommonHorseEquipAvatar);
            avatar.updateUI(baseId);
            avatar.showShadow(false);
            avatar.node.setPosition((this._scrollPage.getPageSize().width / 2, this._scrollPage.getPageSize().height / 2));
            widget.addChild(avatar.node);
        }
        if (selectPos == index) {
            this._updateEquipInfo(baseId);
        }
    }
}